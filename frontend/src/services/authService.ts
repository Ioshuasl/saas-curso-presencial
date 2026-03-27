import { api } from './api'
import {
  clearAuthSession,
  getAuthSession,
  getAuthToken,
  setAuthSession,
  setAuthToken,
} from './authToken'
import type { ApiMessageResponse, LoginRequest, LoginResponse, UsuarioBase } from '../types'

export const authService = {
  async login(payload: LoginRequest) {
    const response = await api.post<LoginResponse>('/login', payload)
    const user = response.data.usuario
    setAuthSession({
      token: response.data.token,
      tenantId: user.tenant_id,
      tenantSlug: payload.tenant_slug,
      userRole: String(user.role ?? user.tipo ?? ''),
    })
    return response
  },

  me() {
    return api.get<UsuarioBase>('/me')
  },

  async logout() {
    try {
      await api.post<ApiMessageResponse>('/logout')
    } finally {
      clearAuthSession()
    }
  },

  setToken(token: string) {
    const current = getAuthSession()
    if (current) {
      setAuthSession({ ...current, token })
      return
    }
    setAuthToken(token)
  },

  getToken() {
    return getAuthToken()
  },

  clearToken() {
    clearAuthSession()
  },

  isAuthenticated() {
    return Boolean(getAuthToken())
  },

  getSession() {
    return getAuthSession()
  },
}
