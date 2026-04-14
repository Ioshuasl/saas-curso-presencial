import axios from 'axios'
import { clearAuthSession, getAuthSession, getAuthToken } from './authToken'

const fallbackApiBaseUrl = import.meta.env.DEV ? 'http://localhost:8080/api' : '/api'
const apiBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || fallbackApiBaseUrl

export const appEnv =
  (import.meta.env.VITE_APP_ENV as string | undefined)?.trim() ||
  (import.meta.env.DEV ? 'development' : 'production')

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getAuthToken()
  const session = getAuthSession()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Propaga tenant ativo para requests autenticadas.
  if (session?.tenantId) {
    config.headers['X-Tenant-Id'] = String(session.tenantId)
  }
  if (session?.tenantSlug) {
    config.headers['X-Tenant-Slug'] = session.tenantSlug
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthSession()
    }

    return Promise.reject(error)
  },
)
