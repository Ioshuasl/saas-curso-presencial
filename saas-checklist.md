# Checklist SaaS (fase simples)

Escopo atual: multi-tenant por `tenant_id`, **sem subdomínio** por enquanto; **modelo comercial / planos** ficam para depois. O foco é: **Tenant**, **Config por tenant**, **coluna `tenant_id` nos models**, e **S3 organizado por tenant**.

---

## 0. Princípios

- `tenant_id` = cliente que consome o SaaS (empresa / conta na plataforma).
- Resolução do tenant **sem subdomínio**: por exemplo JWT com `tenant_id`, ou `usuario.tenant_id` após login, ou header interno `x-tenant-id` só em dev — escolher uma estratégia e documentar no código.
- Toda query de negócio deve considerar o tenant do contexto da requisição.

---

## 1. Model `Tenant` (`backend/src/models/Tenant.js`)

- [ ] Criar arquivo `Tenant.js` com Sequelize (campos sugeridos):
  - `id` (PK)
  - `nome` ou `razao_social` (identificação humana)
  - `slug` opcional (útil no futuro, pode ser nullable)
  - `ativo` (boolean, default `true`)
  - `created_at` / `updated_at` (ou `timestamps: true`)
- [ ] Registrar o model em `backend/src/models/index.js` e exportar.
- [ ] Definir relacionamento: `Tenant.hasMany(Usuario, …)` e `Usuario.belongsTo(Tenant, …)` (e demais models que tiverem `tenant_id`).

---

## 2. Model `Config` (`backend/src/models/Config.js`)

Objetivo: o tenant ajustar opções da conta de forma autônoma (branding, textos, flags, etc.).

- [ ] Criar `Config.js` com:
  - `id` (PK)
  - `tenant_id` (FK obrigatória, `onDelete: 'CASCADE'` ou `RESTRICT` conforme regra de negócio)
  - Estratégia de dados (escolher uma):
    - **Opção A — chave/valor:** `chave` (string), `valor` (texto/JSON string), índice único `(tenant_id, chave)`; ou
    - **Opção B — JSON único por tenant:** um campo `settings` (JSONB) e **uma linha por tenant** (índice único em `tenant_id`).
- [ ] Relacionamentos em `index.js`: `Tenant.hasMany(Config)` ou `Tenant.hasOne(Config)` se for uma linha por tenant (JSON).
- [ ] Rotas/service depois: `GET/PATCH` config restritas ao tenant do usuário autenticado (fora do escopo mínimo deste checklist, mas já previsto).

---

## 3. Adicionar `tenant_id` nos models existentes

Aplicar em **todos** os registros que pertencem a um cliente isolado.

| Model | Ação |
|--------|------|
| `Usuario.js` | Adicionar `tenant_id` (FK → `tenants.id`). Email/login únicos **por tenant**: índice único composto `(tenant_id, email)` se fizer sentido. |
| `Curso.js` | `tenant_id` obrigatório. |
| `SessaoCurso.js` | Opcional mas recomendado: `tenant_id` (denormalizado) para queries rápidas; ou garantir sempre join com `Curso` filtrado por tenant. |
| `Inscricao.js` | `tenant_id` recomendado (denormalizado) ou escopo sempre via `Curso.tenant_id`. |
| `ContaPagar.js` | `tenant_id`. |
| `ContaReceber.js` | `tenant_id`. |
| `ParcelaContaReceber.js` | Opcional: `tenant_id` ou só via `ContaReceber`. |
| `QuestionarioInicial.js` / `FeedbackFinal.js` | Via `inscricao_id` já amarra ao curso; se quiser performance, `tenant_id` denormalizado. |

- [ ] Atualizar cada arquivo em `backend/src/models/*.js` com campo `tenant_id` + `references` ao `Tenant`.
- [ ] Atualizar `index.js`: `belongsTo(Tenant)` onde couber; revisar `unique` que hoje são globais (ex.: email) para ficarem **scoped ao tenant**.

---

## 4. Banco de dados (migrations ou sync)

- [ ] Se o projeto usar **migrations**: criar migration que cria `tenants`, `configs`, adiciona `tenant_id` nas tabelas, cria FKs e índices `(tenant_id, …)`.
- [ ] Se usar **`sequelize.sync`**: após alterar models, rodar em ambiente controlado e fazer **backup** antes; tratar dados existentes com **tenant default** (ex.: um tenant “Legado” e `UPDATE` em massa).
- [ ] Criar pelo menos um `Tenant` seed ou script manual para desenvolvimento.

---

## 5. Camada HTTP (mínimo para o checklist fazer sentido)

- [ ] Incluir `tenant_id` no payload do **JWT** na hora do login (ou derivar sempre de `Usuario.tenant_id`).
- [ ] Middleware `req.tenantId` (ou similar): valida usuário autenticado e garante que o tenant do token bate com o do usuário no banco.
- [ ] Refatorar **services/controllers** para filtrar `where: { tenant_id: req.tenantId }` em listagens, updates e deletes.
- [ ] Em **create**, preencher `tenant_id` automaticamente (não confiar no body do cliente para trocar tenant).

---

## 6. Upload Amazon S3 por `tenant_id`

- [ ] Padronizar prefixo de pastas: `tenants/{tenant_id}/...`  
  Exemplos:
  - uploads genéricos: `tenants/{tenant_id}/uploads/...`
  - imagens de curso: `tenants/{tenant_id}/cursos/...`
- [ ] Ajustar `uploadToS3` (ou os chamadores em `UploadRoutes.js`, `CursoController.js`, etc.) para receber **`tenantId`** e montar a `folder`/key com esse prefixo.
- [ ] Garantir que **delete** no S3 só ocorra para keys que pertençam ao `tenant_id` da requisição (nunca deletar objeto de outro tenant).
- [ ] Opcional: armazenar no banco a **key** S3 (não só URL assinada) para renovar URL e auditar.

---

## 7. Testes manuais rápidos (após implementar)

- [ ] Dois tenants com dados distintos: listar cursos e usuários e confirmar que não há vazamento.
- [ ] Upload de arquivo em cada tenant: objetos aparecem em pastas diferentes no bucket.
- [ ] Exclusão de curso/arquivo: remove só o objeto do tenant correto.

---

## 8. Deixar explícito para o futuro (não fazer agora)

- Subdomínio por tenant.
- Planos, assinatura, webhooks de pagamento, limites por plano.

---

## Ordem sugerida de execução

1. `Tenant` + migration/tabela.  
2. `tenant_id` em `Usuario` + login/JWT + tenant default nos dados legados.  
3. `Config` + migration + associação com `Tenant`.  
4. `tenant_id` nos demais models + FKs + índices.  
5. Middleware + refatoração de services para escopo por tenant.  
6. S3 com prefixo `tenants/{tenant_id}/` em todos os fluxos de upload/delete.

Quando todos os itens da seção 1–6 estiverem marcados, a base SaaS “simples” do backend está pronta para evoluir com subdomínio e billing depois.
