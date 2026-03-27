import type { Aluno, PaginatedResponse, PaginacaoApi } from './usuario'
import type { TenantScopedQuery } from './tenant'

export type CursoSessao = {
  id: number
  tenant_id?: number
  data?: string
  horario_inicio?: string
  horario_fim?: string
  local?: string
}

export type CreateCursoSessaoRequest = {
  id?: number
  data: string
  horario_inicio: string
  horario_fim: string
}

export type Curso = {
  id: number
  tenant_id?: number
  url_imagem?: string | null
  nome: string
  ministrante: string
  descricao?: string | null
  conteudo?: string | null
  valor: number
  vagas: number
  vagas_preenchidas?: number
  vagaspreenchidas?: number
  local?: string | null
  status: boolean
  imagem?: string | null
  sessoes?: CursoSessao[]
  alunos_inscritos?: Aluno[]
  createdAt?: string
  updatedAt?: string
}

export type CursoListQuery = TenantScopedQuery & {
  page?: number
  limit?: number
  nome?: string
  status?: boolean
}

export type CursoByDateQuery = TenantScopedQuery & {
  data: string
}

export type CursoVagasResponse = {
  curso_id: number
  vagas_total: number
  vagas_ocupadas: number
  vagas_disponiveis: number
}

export type CreateCursoRequest = {
  tenant_id?: number
  nome: string
  ministrante: string
  descricao?: string
  conteudo?: string
  valor: number
  vagas: number
  local: string
  status?: boolean
  imagem?: File | null
  sessoes?: CreateCursoSessaoRequest[]
}

export type UpdateCursoRequest = Partial<
  Omit<CreateCursoRequest, 'imagem'> & {
    imagem?: File | null
    url_imagem?: string | null
  }
>

export type CursoListResponse = {
  data: Curso[]
  paginacao: PaginacaoApi
}

export type CursoAlunosResponse = {
  curso: Curso
  alunos: Aluno[]
} | Curso
