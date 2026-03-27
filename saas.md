# Planejamento SaaS - Backend

## 1) Objetivo

Transformar o backend atual em uma plataforma SaaS multi-tenant para gestao de cursos/eventos, com:

- isolamento de dados por cliente (tenant);
- autenticacao e autorizacao robustas;
- cobranca por assinatura;
- observabilidade, seguranca e capacidade de escala.

---

## 2) Visao de arquitetura SaaS

### Modelo recomendado (inicio)

- **Aplicacao unica + banco unico + coluna `tenant_id`** em tabelas de negocio.
- Todas as consultas devem sempre filtrar por `tenant_id`.
- Usuario pode pertencer a 1 tenant (fase inicial) e evoluir para multi-tenant por usuario depois.

### Evolucao futura

- Migrar para **database-per-tenant** apenas se houver necessidade de isolamento forte por contrato/regulacao.
- Manter camada de abstracao de tenant desde o inicio para facilitar migracao.

---

## 3) Roadmap por fases

## Fase 1 - Fundacao multi-tenant (prioridade alta)

### Entregas

1. Criar entidade `Tenant` (empresa/cliente SaaS).
2. Adicionar `tenant_id` nas tabelas principais:
   - usuarios
   - cursos
   - sessoes_curso
   - inscricoes
   - financeiro (contas a pagar/receber)
   - feedbacks/questionarios
3. Criar middleware de resolucao de tenant:
   - por subdominio (`cliente.seudominio.com`) **ou**
   - por header (`x-tenant-id`) no ambiente interno.
4. Injetar `tenant_id` no `req` e aplicar filtro automatico em Services.
5. Garantir que CRUDs so acessam dados do tenant logado.

### Criterios de aceite

- Nao existe retorno de dados entre tenants.
- Todas as rotas protegidas validam `tenant_id`.
- Testes cobrindo isolamento basico.

---

## Fase 2 - Identidade, acesso e seguranca

### Entregas

1. Revisar auth JWT para incluir:
   - `tenant_id`
   - `perfil` (admin/aluno)
   - expiracao curta + refresh token
2. Implementar RBAC por tenant.
3. Hardening:
   - rate limit por IP + tenant
   - CORS por ambiente
   - helmet e validacao de payload em todas as rotas
4. Segredos:
   - remover credenciais hardcoded
   - usar variaveis de ambiente por ambiente (dev/hml/prod)

### Criterios de aceite

- Token invalido/tenant divergente bloqueia acesso.
- Rotas administrativas protegidas por perfil.
- Auditoria minima de login e acoes sensiveis.

---

## Fase 3 - Cobranca e plano de assinatura

### Entregas

1. Entidades de billing:
   - `Plano`
   - `Assinatura`
   - `Fatura`
   - `EventoWebhookPagamento`
2. Integracao com gateway (ex.: Stripe, Asaas, Iugu, Mercado Pago).
3. Webhook idempotente para atualizacao de status da assinatura.
4. Regras de bloqueio/desbloqueio por inadimplencia.
5. Trial de 7/14 dias (opcional).

### Criterios de aceite

- Tenant com pagamento ativo acessa sistema.
- Tenant inadimplente entra em modo restrito.
- Eventos de pagamento nao geram duplicidade.

---

## Fase 4 - Operacao SaaS (escala e confiabilidade)

### Entregas

1. Observabilidade:
   - logs estruturados com `tenant_id`
   - metricas (latencia, erro, throughput)
   - monitoramento de filas/webhooks
2. Jobs assíncronos:
   - notificacoes WhatsApp
   - tarefas agendadas (resumos diarios)
3. Backup e recuperacao:
   - rotina de backup do banco
   - teste de restore periodico
4. Deploy:
   - pipeline CI/CD
   - ambientes separados (dev/hml/prod)

### Criterios de aceite

- Alertas para erro 5xx e fila parada.
- Processo de restore validado.
- Deploy com rollback simples.

---

## 4) Ajustes tecnicos no backend atual

### Multi-tenant (mudancas de codigo)

- Criar middleware `tenantContext`:
  - resolve tenant;
  - valida tenant ativo;
  - popula `req.tenantId`.
- Atualizar Services para receber `tenantId` e aplicar filtros em:
  - `findAll`, `findById`, `create`, `update`, `delete`.
- Evitar `findByPk(id)` sem escopo; usar `findOne({ where: { id, tenant_id } })`.

### Banco e migrations

- Adicionar migrations para `tenant_id` + indices compostos:
  - `(tenant_id, id)`
  - `(tenant_id, created_at)`
  - unicos por tenant quando aplicavel (ex.: email).
- Backfill inicial para tenant default em dados existentes.

### Uploads (S3)

- Padronizar key com tenant:
  - `tenants/{tenant_id}/community/cursos/...`
- Salvar no banco URL e/ou key (preferivel armazenar key + gerar URL assinada sob demanda).
- Remocao de arquivo deve validar tenant antes do delete.

---

## 5) Modelo comercial inicial

- **Plano Base**: limite de usuarios, cursos ativos e armazenamento.
- **Plano Pro**: limites maiores + dashboard avancado.
- **Add-ons**: mensagens/automacoes extras.
- Cobrar mensal e anual (desconto no anual).

---

## 6) Riscos e mitigacoes

- **Risco:** vazamento entre tenants por query sem filtro.  
  **Mitigacao:** camada central de scoping + testes obrigatorios.
- **Risco:** webhook duplicado no billing.  
  **Mitigacao:** idempotencia por `event_id`.
- **Risco:** crescimento de custo de storage S3.  
  **Mitigacao:** lifecycle policy e limites por plano.

---

## 7) KPIs do SaaS

- MRR (receita recorrente mensal)
- Churn mensal
- CAC e payback
- NPS/satisfacao dos alunos
- Uso por tenant (usuarios ativos, cursos ativos)

---

## 8) Plano de execucao (90 dias)

### Dias 1-30

- Fase 1 completa (multi-tenant base + isolamento de dados).
- Ajuste de auth com `tenant_id`.
- Testes de isolamento.

### Dias 31-60

- Fase 2 completa (seguranca e RBAC).
- Inicio da Fase 3 (modelagem de assinatura + gateway).

### Dias 61-90

- Fase 3 completa (cobranca em producao).
- Fase 4 parcial (logs, metricas, backups e CI/CD).

---

## 9) Checklist objetivo de implementacao

- [ ] Criar tabela `tenants`
- [ ] Adicionar `tenant_id` nas entidades principais
- [ ] Middleware `tenantContext` ativo em rotas privadas
- [ ] Refatorar Services para escopo por tenant
- [ ] Ajustar JWT com `tenant_id`
- [ ] Implementar RBAC por tenant
- [ ] Integrar billing e webhooks idempotentes
- [ ] Instrumentar logs/metricas com `tenant_id`
- [ ] Definir limites por plano
- [ ] Criar testes de isolamento e regressao

