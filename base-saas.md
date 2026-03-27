## Base SaaS (Multi-tenant solido)

### Visao geral
Este projeto usa multi-tenant com a ideia de que **todo registro de negocio pertence a um `tenant_id`**.
O backend garante isolamento de dados entre tenants aplicando `tenant_id` em:
- `where` de consultas e deletes
- valores `tenant_id` em creates/upserts
- validacoes de acesso em controladores (quando aplicavel)

### Entidades principais
1. `Tenant`
   - Identifica a conta/clienete SaaS (um "cliente" da plataforma).
   - Possui `id`, `slug`, `ativo`, etc.
2. `Config`
   - Configuracao do tenant.
   - Relacao 1:1 com `tenant_id`.
3. `Usuario`
   - Usuarios do sistema, sempre com `tenant_id`.
   - `role` (papel) no contexto do tenant, ou papel global do SaaS.

### Roles (Usuario.role)
- `ADMIN`: admin do tenant (controla cursos/inscricoes/financeiro dentro do proprio tenant)
- `ALUNO`: aluno do tenant
- `SAAS_ADMIN`: admin global do SaaS
  - Pode gerenciar **todos os tenants** e seus respectivos dados (cursos, usuarios, financeiro, etc.)
  - Pode acessar e operar `Tenant` e `Config` de qualquer tenant

### Tenant no JWT / middleware
O `authMiddleware`:
- extrai `tenant_id` do usuario logado
- seta `req.userId`, `req.userRole` e `req.tenantId`
- valida que o token esta alinhado ao `usuario.tenant_id` (evita token trocado entre tenants)

Isso garante que, por padrao, toda operacao fica limitada ao tenant do usuario logado.

### Escopo em services (anti vazamento)
A camada de services deve:
- receber `tenantId` explicitamente (ou receber `req.tenantId` do controller)
- sempre mesclar `tenant_id` no `where` usando helpers como:
  - `mergeTenantWhere(tenantId, where)`
  - `whereTenantOnly(tenantId)`
  - `requireTenantId(tenantId)`
- nunca fazer consultas/updates que nao incluam `tenant_id` (exceto para rotas globais bem definidas)

### Como o SAAS_ADMIN opera tenants (tenant alvo)
Para permitir que o `SAAS_ADMIN` escolha *qual tenant* ele quer operar (ex.: quando ele esta gerenciando conteudo de um cliente especifico), existe um helper:
- `resolveTenantIdForAdminRequest(req)`

Regras:
- Se `req.userRole !== 'SAAS_ADMIN'`: retorna `req.tenantId`
- Se `req.userRole === 'SAAS_ADMIN'`:
  - aceita `tenant_id` e/ou `tenant_slug` via query params
  - se nao informar, cai para `req.tenantId`
  - se a rota usar `:tenantId` no path, tambem da suporte (quando aplicavel)

Exemplos de chamada (como SAAS_ADMIN):
- `GET /cursos?tenant_id=3`
- `GET /contas-pagar?tenant_slug=minha-clinica`
- `GET /tenants/:tenantId/config` (path ja identifica o tenant)

### Bypass de Tenant/Config para SAAS_ADMIN
Para evitar bloqueios que so fazem sentido para `ADMIN` do tenant:
- `TenantService` e `ConfigController` tratam `SAAS_ADMIN` como permissao global
- `SAAS_ADMIN` consegue listar/ler/alterar/excluir qualquer tenant e qualquer configuracao
- `ADMIN` do tenant continua restrito ao proprio tenant

### Observacao importante sobre paginas "publicas"
Algumas rotas publicas (ex.: listar cursos disponiveis) podem depender de `tenant_id/tenant_slug` via query.
Isso e intencional quando nao existe `authMiddleware` nessas rotas.
Para operacoes de administracao, prefira rotas protegidas (com JWT).

### Recomendacoes para manter a base solida
1. Para toda nova operacao em que um model e tenant-scoped:
   - incluir `tenant_id` no `where`
   - setar `tenant_id` em creates/upserts
2. Ao criar/alterar controller:
   - usar `resolveTenantIdForAdminRequest(req)` sempre que o controller chama services tenant-scoped
3. Ao adicionar uma nova role:
   - atualizar: enum do model, middleware de permissao e bypass/escopo

### Bootstrap do primeiro SAAS_ADMIN
O cadastro de usuarios via endpoints esta protegido por `adminOnly` (agora aceita `SAAS_ADMIN`).
Entao para iniciar um ambiente SaaS:
- crie o primeiro `SAAS_ADMIN` via seed/script/SQL (fora da API)
- depois esse usuario pode criar admins do proprio tenant alvo (via rotas protegidas)

