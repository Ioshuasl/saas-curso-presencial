import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearAuthSession,
  getAuthSession,
  getAuthToken,
  setAuthSession,
} from './authToken'

function createLocalStorageMock() {
  const store = new Map<string, string>()

  return {
    getItem(key: string) {
      return store.get(key) ?? null
    },
    setItem(key: string, value: string) {
      store.set(key, value)
    },
    removeItem(key: string) {
      store.delete(key)
    },
    clear() {
      store.clear()
    },
  }
}

describe('auth token/session hardening', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock())
    clearAuthSession()
  })

  it('limpa contexto completo ao trocar tenant por mismatch', () => {
    setAuthSession({
      token: 'token-tenant-1',
      tenantId: 1,
      tenantSlug: 'barbearia-exemplo-1',
      userRole: 'ADMIN',
    })

    clearAuthSession()

    expect(getAuthToken()).toBeNull()
    expect(getAuthSession()).toBeNull()
  })

  it('logout remove token e tenant da sessao', () => {
    setAuthSession({
      token: 'token-admin',
      tenantId: 2,
      tenantSlug: 'barbearia-exemplo-2',
      userRole: 'SAAS_ADMIN',
    })

    clearAuthSession()

    expect(getAuthToken()).toBeNull()
    expect(getAuthSession()).toBeNull()
  })
})

