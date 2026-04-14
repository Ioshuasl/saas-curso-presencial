# Plano de Migracao: Tenant por Dominio/Subdominio

## Objetivo

Migrar a identificacao de tenant baseada em `slug` para um modelo baseado em dominio/subdominio proprio, sem quebrar o fluxo atual e com compatibilidade temporaria.

Este plano considera o backend atual em `backend/src` e prepara o sistema para:

- resolver tenant automaticamente via host (`dominio` / `subdominio`);
- manter `slug` como fallback durante transicao;
- preservar isolamento multi-tenant por token (`tenant_id`) nas rotas autenticadas.

---

## Diagnostico do estado atual (backend)

## 1) Modelo e validacao de tenant

- `backend/src/models/Tenant.js`: tenant tem `id`, `nome`, `slug`, `ativo`.
- `backend/src/schema/TenantSchema.js`: cria/edita tenant com `slug`.
- `backend/src/services/TenantService.js`: CRUD usa `slug` como identificador funcional para acesso no frontend.

## 2) Resolucao de tenant em runtime

- `backend/src/utils/tenantContext.js`:
  - resolve tenant por `tenant_id` ou `tenant_slug`.
  - hoje o fluxo depende de body/query (`tenant_slug`).
- `backend/src/utils/tenantAdminContext.js`:
  - em rotas autenticadas, tenant vem do token (`req.tenantId`).

## 3) Login e autenticacao

- `backend/src/schema/UsuarioSchema.js`: login aceita `tenant_id`/`tenant_slug`.
- `backend/src/services/UsuarioService.js`: login:
  - tenta por tenant informado;
  - fallback para `SAAS_ADMIN` global.
- `backend/src/middlewares/auth.js`:
  - token JWT exige `tenant_id`;
  - toda rota autenticada carrega `req.tenantId` do token.

## 4) Endpoints dependentes de contexto de tenant

Arquivos com maior impacto:

- `controllers`: `CursoController`, `UsuarioController`, `TenantController`, `ConfigController` etc.
- `services`: `CursoService`, `InscricaoService`, `ContaPagarService`, `ContaReceberService`, `FeedbackFinalService`, `QuestionarioInicialService`.
- `routes`: `CursoRoutes`, `UsuarioRoutes`, `TenantRoutes`, `ContaPagarRoutes`, `ContaReceberRoutes`, `FinanceiroRoutes`.

Hoje, parte das rotas publicas depende de query (`tenant_slug`) para leitura; rotas autenticadas sempre dependem do token.

---

## Arquitetura alvo recomendada

## Recomendacao principal

Criar entidade separada de dominio para suportar evolucao sem travar o `Tenant`:

- nova tabela/model: `TenantDomain`
  - `id`
  - `tenant_id` (FK)
  - `host` (ex.: `metodocap.com` ou `metodocap.seudominio.com`)
  - `tipo` (`CUSTOM_DOMAIN` | `SUBDOMAIN`)
  - `is_primary` (bool)
  - `verified_at` (nullable)
  - `status` (`PENDING`, `VERIFIED`, `FAILED`)
  - `ativo` (bool)

Manter `tenants.slug` por compatibilidade temporaria (legado) ate concluir rollout.

## Resolucao central de tenant por host

Criar middleware unico, por exemplo `backend/src/middlewares/tenantResolver.js`:

- ler host real por prioridade:
  1. `x-forwarded-host`
  2. `host`
  3. opcional: `x-tenant-host` (apenas ambiente interno)
- normalizar (`lowercase`, remover porta).
- resolver tenant por `TenantDomain.host`.
- fallback (transicao): `tenant_slug` query/body.
- preencher contexto:
  - `req.resolvedTenantId`
  - `req.resolvedTenantSource` (`host`, `slug`, `token`).

Regra de seguranca:

- Rotas autenticadas: **token continua soberano** (`req.tenantId`).
- Rotas publicas/login: pode usar `req.resolvedTenantId`.

---

## Fases de implementacao

## Fase 1 - Base de dados e modelos

1. Criar model `TenantDomain`.
2. Adicionar associacao em `backend/src/models/index.js`:
   - `Tenant.hasMany(TenantDomain, { as: 'domains' })`
   - `TenantDomain.belongsTo(Tenant)`
3. Criar migration (ou sync inicial) para tabela e indices:
   - `UNIQUE(host)`
   - indice em `tenant_id`.

## Fase 2 - Servicos de dominio

Criar `TenantDomainService` para:

- cadastrar dominio/subdominio;
- definir primario;
- validar unicidade;
- marcar verificacao (DNS/HTTP) no futuro.

Atualizar `TenantService` para expor dominio primario no retorno.

## Fase 3 - Resolver de tenant

1. Criar `tenantResolver` middleware.
2. Aplicar em `server.js` antes das rotas `/api`.
3. Refatorar `resolveTenantId` (`tenantContext.js`) para usar host + fallback slug.

## Fase 4 - Login e rotas publicas

1. Login (`UsuarioService.login`):
   - `SAAS_ADMIN`: pode autenticar sem tenant.
   - `ADMIN/ALUNO`: exige tenant resolvido por host (ou fallback slug durante transicao).
2. Rotas publicas (`CursoController`, catalogo, vagas, por-data):
   - trocar dependencia de query por `req.resolvedTenantId`.

## Fase 5 - Compatibilidade e deprecacao do slug

1. Marcar `tenant_slug` como legado em docs.
2. Logar uso de fallback slug para medir adocao.
3. Remover fallback slug quando uso zerar.

## Fase 6 - Testes e rollout

- testes unitarios:
  - resolve por host principal;
  - host desconhecido;
  - host com porta;
  - fallback slug.
- testes de seguranca:
  - token tenant diferente do host nao deve cruzar dados.
- rollout gradual:
  - staging com dominios reais;
  - producao com observabilidade.

---

## Mapa de arquivos com ajuste futuro

## Modelos / DB

- `backend/src/models/Tenant.js` (manter slug legado)
- `backend/src/models/index.js` (novas associacoes)
- `backend/src/models/TenantDomain.js` (novo)

## Utilitarios / middlewares

- `backend/src/utils/tenantContext.js` (resolver por host + fallback)
- `backend/src/utils/tenantAdminContext.js` (manter regra token)
- `backend/src/middlewares/auth.js` (sem quebra, validar coerencia token x tenant quando necessario)
- `backend/src/middlewares/tenantResolver.js` (novo)

## Controllers / services

- `backend/src/controllers/CursoController.js` (trocar query por tenant resolvido)
- `backend/src/services/UsuarioService.js` (login por host)
- `backend/src/services/TenantService.js` (retornar dominios)
- `backend/src/controllers/TenantController.js` (gestao de dominios)
- `backend/src/services/ConfigService.js` e outros: sem mudanca estrutural, seguem por `tenant_id`.

## Rotas

- `backend/src/routes/index.js` (apenas ordem/middleware global)
- `backend/src/routes/TenantRoutes.js` (novos endpoints de dominio)
- `backend/src/routes/UsuarioRoutes.js` (ajustes de documentacao/contrato de login)
- `backend/src/routes/CursoRoutes.js` (documentacao de tenant por host)

## Schemas

- `backend/src/schema/TenantSchema.js` (campos de dominio/subdominio)
- `backend/src/schema/UsuarioSchema.js` (login sem obrigar slug no modelo final)
- `backend/src/schema/TenantContextSchema.js` (transicao/fallback)

## Seeds

- `backend/src/seeds/001-tenants.cjs`
- `backend/src/seeds/003-users.cjs`
- adicionar seed de `tenant_domains`.

---

## Contrato futuro de API (proposta)

## Login

- `POST /login`
  - nao precisa enviar `tenant_slug` quando o host ja identifica tenant.
  - `SAAS_ADMIN`: pode logar sem tenant.
  - `ADMIN/ALUNO`: exige tenant resolvido por host ou fallback legado.

## Tenants

- `POST /tenants/:id/domains`
- `GET /tenants/:id/domains`
- `PATCH /tenants/:id/domains/:domainId/primary`
- `DELETE /tenants/:id/domains/:domainId`

---

## Observacao de infraestrutura (EasyPanel + Hostinger VPS)

Para o seu cenario atual (VPS propria com EasyPanel), a ideia geral esta correta:

1. cliente aponta dominio/subdominio para o IP da sua VPS;
2. voce cadastra o dominio no app de frontend no EasyPanel.

Mas existe um ponto critico para a migracao por host:

- se a API ficar em um dominio unico (ex.: `api.seudominio.com`), o backend nao ve o host do tenant automaticamente em todas as requisicoes;
- para resolver tenant por dominio com confianca, o backend precisa receber o host de origem do tenant.

### Modelos de operacao possiveis

## Modelo A (mais simples de operar no curto prazo)

- frontend multi-dominio (cada tenant no proprio dominio/subdominio);
- backend central em um dominio unico;
- frontend envia header adicional com host da aplicacao (ex.: `X-App-Host`).

Recomendacao de seguranca para esse modelo:

- validar `Origin`/`Referer` no backend;
- usar `X-App-Host` apenas em rotas publicas/login;
- em rotas autenticadas, continuar usando `tenant_id` do token como fonte de verdade.

## Modelo B (mais alinhado ao tenant por host nativo)

- frontend e backend roteados de modo que o backend receba o host do tenant (via proxy/reverse proxy);
- resolver tenant no backend direto por `x-forwarded-host`/`host`, sem depender de header custom do frontend.

Esse modelo reduz acoplamento com cliente e simplifica auditoria.

### O que adicionar ao onboarding de tenant

Para cada novo tenant com dominio proprio:

- registrar `A`/`CNAME` apontando para sua VPS;
- cadastrar dominio no EasyPanel (frontend, e opcionalmente backend/proxy conforme modelo);
- registrar dominio no novo cadastro de dominios do tenant (`TenantDomain`);
- validar propagacao DNS e emitir SSL antes de ativar tenant em producao.

---

## Riscos e mitigacoes

- **Risco: conflito de host duplicado**  
  Mitigacao: `UNIQUE(host)` + validacao no service.

- **Risco: proxy encaminhar host errado**  
  Mitigacao: whitelist de cabecalhos confiaveis e normalizacao strict.

- **Risco: quebra em clientes antigos com `tenant_slug`**  
  Mitigacao: fase de fallback + telemetria de uso.

- **Risco: acesso cross-tenant**  
  Mitigacao: manter `req.tenantId` do token como fonte de verdade nas rotas autenticadas.

---

## Ordem sugerida de execucao (pratica)

1. Criar `TenantDomain` + associacoes.  
2. Implementar `tenantResolver` + fallback slug.  
3. Ajustar login para usar host resolvido.  
4. Refatorar rotas publicas para `req.resolvedTenantId`.  
5. Expor CRUD de dominios em `TenantRoutes`.  
6. Atualizar seeds/docs e iniciar deprecacao de slug.

---

## Resultado esperado

Ao final da migracao:

- tenant sera identificado por dominio/subdominio de forma nativa;
- `slug` vira compatibilidade temporaria e depois pode ser removido;
- `SAAS_ADMIN` continua global;
- `ADMIN/ALUNO` permanecem isolados por tenant de forma segura.

