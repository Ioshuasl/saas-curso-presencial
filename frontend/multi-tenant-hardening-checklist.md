# Frontend Multi-tenant Hardening Checklist

## Escopo automatizado (fase 6)

- [x] Tenant 1 logado nao consegue operar com URL do tenant 2 (forca relogin)
- [x] Troca de tenant limpa contexto local (`token` + `session`)
- [x] Logout remove contexto completo (`token`, `tenantId`, `tenantSlug`, `userRole`)

## Fluxo manual recomendado

1. Login no tenant `barbearia-exemplo-1` com usuario admin.
2. Abrir URL com `tenant_slug=barbearia-exemplo-2`.
3. Validar que app volta para login e exige nova autenticacao.
4. Fazer login no tenant `barbearia-exemplo-2` e validar dados isolados.
5. Executar logout e confirmar localStorage sem chaves `saas-auth-token` e `saas-auth-session`.

## Comandos de validacao

- `npm run lint`
- `npm run test`

