import { describe, expect, it } from 'vitest'

import { stripTenantScope } from './tenantScope'

describe('tenant scope payload guard', () => {
  it('remove tenant_id e tenant_slug de payloads', () => {
    const result = stripTenantScope({
      nome: 'Admin Teste',
      tenant_id: 1,
      tenant_slug: 'barbearia-exemplo-1',
    })

    expect(result).toEqual({ nome: 'Admin Teste' })
  })
})

