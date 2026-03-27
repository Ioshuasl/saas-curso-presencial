import { describe, expect, it } from 'vitest'

import { resolveTenantNavigationAction } from './tenantSessionFlow'

describe('tenant session flow hardening', () => {
  it('impede usuario do tenant 1 de operar no tenant 2', () => {
    const action = resolveTenantNavigationAction({
      isAuthenticated: true,
      sessionTenantSlug: 'barbearia-exemplo-1',
      urlTenantSlug: 'barbearia-exemplo-2',
    })

    expect(action).toBe('force_relogin_mismatch')
  })

  it('sincroniza URL quando tenant esta ausente na navegacao', () => {
    const action = resolveTenantNavigationAction({
      isAuthenticated: true,
      sessionTenantSlug: 'barbearia-exemplo-1',
      urlTenantSlug: null,
    })

    expect(action).toBe('sync_url_to_session')
  })
})

