import { api } from './api'
import { stripTenantScope } from './tenantScope'
import type {
  Admin,
  AdminListResponse,
  Aluno,
  AlunoDetalheResponse,
  AlunoListResponse,
  ApiMessageResponse,
  CreateAdminRequest,
  CreateAlunoRequest,
  LoginRequest,
  LoginResponse,
  UpdateAdminRequest,
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

  listarAlunos(params?: UsuarioListQuery) {
    return api.get<AlunoListResponse>('/usuarios/alunos', { params: params ? stripTenantScope(params) : undefined })
  },

  buscarAdminPorId(id: number) {
    return api.get<Admin>(`/usuarios/admin/${id}`)
  },

  buscarAlunoPorId(id: number) {
    return api.get<AlunoDetalheResponse>(`/usuarios/aluno/${id}`)
  },

  atualizarAdmin(id: number, payload: UpdateAdminRequest) {
    return api.put<Admin>(`/usuarios/admin/${id}`, stripTenantScope(payload))
  },

  atualizarAluno(id: number, payload: UpdateAlunoRequest) {
    return api.put<Aluno>(`/usuarios/aluno/${id}`, stripTenantScope(payload))
  },

  deletarUsuario(id: number) {
    return api.delete<ApiMessageResponse>(`/usuarios/${id}`)
  },
}
