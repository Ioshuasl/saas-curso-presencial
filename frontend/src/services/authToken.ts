const AUTH_TOKEN_KEY = 'saas-auth-token'
const AUTH_SESSION_KEY = 'saas-auth-session'

export type AuthSession = {
  token: string
  tenantId?: number
  tenantSlug?: string
  userRole?: string
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function getAuthSession(): AuthSession | null {
  const raw = localStorage.getItem(AUTH_SESSION_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as AuthSession
    if (!parsed?.token) return null
    return parsed
  } catch {
    return null
  }
}

export function setAuthSession(session: AuthSession) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
  setAuthToken(session.token)
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_SESSION_KEY)
  clearAuthToken()
}
