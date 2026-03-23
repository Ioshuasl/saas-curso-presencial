import type { Curso } from './curso'
import type { UsuarioBase } from './usuario'

export type QuestionarioInicial = {
  id: number
  curso_id: number
  usuario_id: number
  dores?: string | null
  expectativas?: string | null
  objetivo_principal?: string | null
  curso?: Curso
  usuario?: UsuarioBase
  createdAt?: string
  updatedAt?: string
}

export type CreateQuestionarioInicialRequest = {
  curso_id: number
  dores?: string
  expectativas?: string
  objetivo_principal?: string
}
