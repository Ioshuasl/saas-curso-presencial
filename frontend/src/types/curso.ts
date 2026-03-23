import type { Aluno, PaginatedResponse } from './usuario'

export type CursoSessao = {
  id: number
  data?: string
  horario_inicio?: string
  horario_fim?: string
  local?: string
}

export type Curso = {
  id: number
  nome: string
  ministrante: string
  descricao?: string | null
  conteudo?: string | null
  valor: number
  vagas: number
  local?: string | null
  status: boolean
  imagem?: string | null
  sessoes?: CursoSessao[]
  createdAt?: string
  updatedAt?: string
}

export type CursoListQuery = {
  page?: number
  limit?: number
  nome?: string
  status?: boolean
}

export type CursoByDateQuery = {
  data: string
}

export type CursoVagasResponse = {
  curso_id: number
  vagas_total: number
  vagas_ocupadas: number
  vagas_disponiveis: number
}

export type CreateCursoRequest = {
  nome: string
  ministrante: string
  descricao?: string
  conteudo?: string
  valor: number
  vagas: number
  local: string
  status?: boolean
  imagem?: File | null
}

export type UpdateCursoRequest = Partial<
  Omit<CreateCursoRequest, 'imagem'> & { imagem: string }
>

export type CursoListResponse = PaginatedResponse<Curso>

export type CursoAlunosResponse = {
  curso: Curso
  alunos: Aluno[]
}
