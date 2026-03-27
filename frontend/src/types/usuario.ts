export type UsuarioTipo = 'ADMIN' | 'ALUNO'

export type UsuarioBase = {
  id: number
  tenant_id?: number
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
  perfil_admin?: {
    usuario_id: number
    nome_completo: string
  } | null
  perfil_aluno?: {
    usuario_id: number
    nome_completo: string
  } | null
}

export type Admin = UsuarioBase & {
  tipo: 'ADMIN'
}

export type Aluno = UsuarioBase & {
  tipo: 'ALUNO'
  total_cursos_inscritos?: number
}

export type AlunoDetalheSessaoCurso = {
  id: number
  tenant_id?: number
  curso_id: number
  data: string
  horario_inicio: string
  horario_fim: string
  created_at?: string
  updated_at?: string
  createdAt?: string
  updatedAt?: string
}

export type AlunoDetalheCurso = {
  id: number
  tenant_id?: number
  url_imagem?: string | null
  nome: string
  ministrante?: string | null
  descricao?: string | null
  conteudo?: string | null
  valor?: number | string
  vagas?: number
  local?: string | null
  status?: boolean
  sessoes?: AlunoDetalheSessaoCurso[]
  created_at?: string
  updated_at?: string
  createdAt?: string
  updatedAt?: string
}

export type AlunoDetalheQuestionarioInicial = {
  id: number
  tenant_id?: number
  inscricao_id: number
  maior_dor_inicio: string
  principal_expectativa: string
  created_at?: string
  updated_at?: string
  createdAt?: string
  updatedAt?: string
}

export type AlunoDetalheFeedbackFinal = {
  id: number
  tenant_id?: number
  inscricao_id: number
  objetivo_atingido: string
  resultado_esperado?: string | null
  avaliacao: number
  created_at?: string
  updated_at?: string
  createdAt?: string
  updatedAt?: string
}

export type AlunoDetalheInscricao = {
  id: number
  tenant_id?: number
  aluno_id: number
  curso_id: number
  data_inscricao?: string
  presenca_confirmada?: boolean
  curso?: AlunoDetalheCurso | null
  questionario_inicial?: AlunoDetalheQuestionarioInicial | null
  feedback_final?: AlunoDetalheFeedbackFinal | null
  created_at?: string
  updated_at?: string
  createdAt?: string
  updatedAt?: string
}

export type AlunoDetalhe = Aluno & {
  perfil_aluno?: {
    usuario_id: number
    tenant_id?: number
    nome_completo: string
    telefone?: string | null
    cidade?: string | null
    profissao?: string | null
    biografia?: string | null
    created_at?: string
    updated_at?: string
    createdAt?: string
    updatedAt?: string
  } | null
  inscricoes?: AlunoDetalheInscricao[]
}

export type AlunoDetalheResponse = AlunoDetalhe

export type LoginRequest = {
  identificador: string
  senha: string
  tenant_id?: number
  tenant_slug?: string
}

export type LoginResponse = {
  token: string
  usuario: UsuarioBase
}

export type CreateAdminRequest = {
  tenant_id?: number
  username: string
  email: string
  cpf?: string
  senha: string
  nome_completo: string
  telefone?: string
  status?: boolean
}

export type CreateAlunoRequest = {
  tenant_id?: number
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
  username?: string
  email?: string
  status?: string
  sort?: 'id' | 'username' | 'email' | 'status' | 'created_at' | 'nome_completo'
  order?: 'ASC' | 'DESC'
}

export type PerfilAdmin = {
  usuario_id: number
  tenant_id?: number
  nome_completo: string
}

export type AdminListItem = {
  id: number
  tenant_id?: number
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

export type AlunoListResponse = {
  data: Aluno[]
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
