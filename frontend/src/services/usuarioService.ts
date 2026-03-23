import { api } from './api'
import type {
  Admin,
  AdminListResponse,
  Aluno,
  ApiMessageResponse,
  CreateAdminRequest,
  CreateAlunoRequest,
  LoginRequest,
  LoginResponse,
  PaginatedResponse,
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
    return api.post<Admin>('/usuarios/admin', payload)
  },

  criarAluno(payload: CreateAlunoRequest) {
    return api.post<Aluno>('/usuarios/aluno', payload)
  },

  me() {
    return api.get<UsuarioBase>('/me')
  },

  logout() {
    return api.post<ApiMessageResponse>('/logout')
  },

  listarAdmins(params?: UsuarioListQuery) {
    return api.get<AdminListResponse>('/usuarios/admins', { params })
  },

  listarAlunos(params?: UsuarioListQuery) {
    return api.get<PaginatedResponse<Aluno>>('/usuarios/alunos', { params })
  },

  buscarAdminPorId(id: number) {
    return api.get<Admin>(`/usuarios/admin/${id}`)
  },

  buscarAlunoPorId(id: number) {
    return api.get<Aluno>(`/usuarios/aluno/${id}`)
  },

  atualizarAdmin(id: number, payload: UpdateAdminRequest) {
    return api.put<Admin>(`/usuarios/admin/${id}`, payload)
  },

  atualizarAluno(id: number, payload: UpdateAlunoRequest) {
    return api.put<Aluno>(`/usuarios/aluno/${id}`, payload)
  },

  deletarUsuario(id: number) {
    return api.delete<ApiMessageResponse>(`/usuarios/${id}`)
  },
}
