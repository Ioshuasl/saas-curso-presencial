export type UsuarioTipo = 'ADMIN' | 'ALUNO'

export type UsuarioBase = {
  id: number
  username: string
  email: string
  cpf?: string | null
  status?: boolean
  nome_completo: string
  telefone?: string | null
  cidade?: string | null
  profissao?: string | null
  biografia?: string | null
  tipo?: UsuarioTipo
  role?: UsuarioTipo | string
  createdAt?: string
  updatedAt?: string
  created_at?: string
  updated_at?: string
}

export type Admin = UsuarioBase & {
  tipo: 'ADMIN'
}

export type Aluno = UsuarioBase & {
  tipo: 'ALUNO'
}

export type LoginRequest = {
  identificador: string
  senha: string
}

export type LoginResponse = {
  token: string
  usuario: UsuarioBase
}

export type CreateAdminRequest = {
  username: string
  email: string
  cpf?: string
  senha: string
  nome_completo: string
  telefone?: string
  status?: boolean
}

export type CreateAlunoRequest = {
  username: string
  email: string
  senha: string
  nome_completo: string
  telefone?: string
  cidade?: string
  profissao?: string
  biografia?: string
  curso_id?: number
}

export type UpdateAdminRequest = Partial<
  Omit<CreateAdminRequest, 'senha'> & { senha: string }
>

export type UpdateAlunoRequest = Partial<
  Omit<CreateAlunoRequest, 'curso_id' | 'senha'> & { senha: string; curso_id: number }
>

export type UsuarioListQuery = {
  page?: number
  limit?: number
  por_pagina?: number
  search?: string
  nome?: string
  status?: string
}

export type PerfilAdmin = {
  usuario_id: number
  nome_completo: string
}

export type AdminListItem = {
  id: number
  username: string
  email: string
  cpf?: string | null
  role: UsuarioTipo | string
  status: boolean
  created_at: string
  updated_at: string
  perfil_admin: PerfilAdmin
}

export type PaginacaoApi = {
  total: number
  total_paginas: number
  pagina: number
  por_pagina: number
}

export type AdminListResponse = {
  data: AdminListItem[]
  paginacao: PaginacaoApi
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages?: number
}

export type ApiMessageResponse = {
  message: string
}
