import { api } from './api'
import { stripTenantScope } from './tenantScope'
import type {
  Admin,
  AdminListResponse,
  SaasAdminListResponse,
  Aluno,
  AlunoDetalheResponse,
  AlunoListResponse,
  ApiMessageResponse,
  CreateAdminRequest,
  CreateSaasAdminRequest,
  CreateAlunoRequest,
  LoginRequest,
  LoginResponse,
  UpdateAdminRequest,
  UpdateSaasAdminRequest,
  UpdateAlunoRequest,
  UsuarioBase,
  UsuarioListQuery,
} from '../types'

export const usuarioService = {
  login(payload: LoginRequest) {
    return api.post<LoginResponse>('/login', payload)
  },

  criarAdmin(payload: CreateAdminRequest) {
    return api.post<Admin>('/usuarios/admin', stripTenantScope(payload))
  },

  criarAluno(payload: CreateAlunoRequest) {
    return api.post<Aluno>('/usuarios/aluno', stripTenantScope(payload))
  },

  me() {
    return api.get<UsuarioBase>('/me')
  },

  logout() {
    return api.post<ApiMessageResponse>('/logout')
  },

  listarAdmins(params?: UsuarioListQuery) {
    return api.get<AdminListResponse>('/usuarios/admins', { params: params ? stripTenantScope(params) : undefined })
  },

  listarSaasAdmins(params?: UsuarioListQuery) {
    return api.get<SaasAdminListResponse>('/usuarios/saas-admins', {
      params: params ? stripTenantScope(params) : undefined,
    })
  },

  listarAlunos(params?: UsuarioListQuery) {
    return api.get<AlunoListResponse>('/usuarios/alunos', { params: params ? stripTenantScope(params) : undefined })
  },

  buscarAdminPorId(id: number) {
    return api.get<Admin>(`/usuarios/admin/${id}`)
  },

  buscarSaasAdminPorId(id: number) {
    return api.get<Admin>(`/usuarios/saas-admin/${id}`)
  },

  buscarAlunoPorId(id: number) {
    return api.get<AlunoDetalheResponse>(`/usuarios/aluno/${id}`)
  },

  atualizarAdmin(id: number, payload: UpdateAdminRequest) {
    return api.put<Admin>(`/usuarios/admin/${id}`, stripTenantScope(payload))
  },

  criarSaasAdmin(payload: CreateSaasAdminRequest) {
    return api.post<Admin>('/usuarios/saas-admin', stripTenantScope(payload))
  },

  atualizarSaasAdmin(id: number, payload: UpdateSaasAdminRequest) {
    return api.put<Admin>(`/usuarios/saas-admin/${id}`, stripTenantScope(payload))
  },

  atualizarAluno(id: number, payload: UpdateAlunoRequest) {
    return api.put<Aluno>(`/usuarios/aluno/${id}`, stripTenantScope(payload))
  },

  deletarUsuario(id: number) {
    return api.delete<ApiMessageResponse>(`/usuarios/${id}`)
  },

  deletarSaasAdmin(id: number) {
    return api.delete<ApiMessageResponse>(`/usuarios/saas-admin/${id}`)
  },
}
