import axios from 'axios'
import { clearAuthSession, getAuthSession, getAuthToken } from './authToken'

export const api = axios.create({
  baseURL: 'http://localhost:3000/api',
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
