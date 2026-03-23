import { api } from './api'
import { clearAuthToken, getAuthToken, setAuthToken } from './authToken'
import type { ApiMessageResponse, LoginRequest, LoginResponse, UsuarioBase } from '../types'

export const authService = {
  async login(payload: LoginRequest) {
    const response = await api.post<LoginResponse>('/login', payload)
    setAuthToken(response.data.token)
    return response
  },

  me() {
    return api.get<UsuarioBase>('/me')
  },

  async logout() {
    try {
      await api.post<ApiMessageResponse>('/logout')
    } finally {
      clearAuthToken()
    }
  },

  setToken(token: string) {
    setAuthToken(token)
  },

  getToken() {
    return getAuthToken()
  },

  clearToken() {
    clearAuthToken()
  },

  isAuthenticated() {
    return Boolean(getAuthToken())
  },
}
