import { api } from './api'
import {
  clearAuthSession,
  getAuthSession,
  getAuthToken,
  setAuthSession,
  setAuthToken,
} from './authToken'
import { usuarioService } from './usuarioService'
import type {
  AlunoSelfRegisterRequest,
  AlunoSelfRegisterResponse,
  ApiMessageResponse,
  LoginRequest,
  LoginResponse,
  UsuarioBase,
} from '../types'

function assertAlunoCadastroCompleto(
  usuario: AlunoSelfRegisterResponse['usuario'] | undefined,
  token: string | undefined,
) {
  if (!token?.trim()) {
    throw new Error('Cadastro concluído sem token de autenticação.')
  }
  if (!usuario?.id) {
    throw new Error('Cadastro incompleto: usuário não foi criado.')
  }
  if (!usuario.tenant_id) {
    throw new Error('Cadastro incompleto: usuário não vinculado ao tenant.')
  }
}

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

  /**
   * Auto-cadastro público: aguarda criação + vínculo ao tenant no backend,
   * persiste sessão e confirma com GET /me antes de retornar.
   */
  async cadastrarAluno(payload: AlunoSelfRegisterRequest) {
    const response = await usuarioService.cadastrarAlunoPublico(payload)
    const { usuario, token } = response.data

    assertAlunoCadastroCompleto(usuario, token)

    const tenantSlug =
      payload.tenant_slug?.trim() || usuario.tenant?.slug || undefined

    setAuthSession({
      token,
      tenantId: usuario.tenant_id,
      tenantSlug,
      userRole: String(usuario.role ?? usuario.tipo ?? 'ALUNO'),
    })

    try {
      const meResponse = await api.get<UsuarioBase>('/me')
      const confirmed = meResponse.data

      if (!confirmed?.id || Number(confirmed.tenant_id) !== Number(usuario.tenant_id)) {
        throw new Error('Não foi possível confirmar o vínculo do usuário ao tenant.')
      }

      return {
        ...response,
        data: {
          token,
          usuario: confirmed,
        },
      }
    } catch (error) {
      clearAuthSession()
      throw error
    }
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
