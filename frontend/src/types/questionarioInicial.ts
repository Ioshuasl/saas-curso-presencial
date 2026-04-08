import type { Curso } from './curso'
import type { UsuarioBase } from './usuario'

/** Resposta da API (modelo Sequelize). */
export type QuestionarioInicial = {
  id: number
  tenant_id?: number
  inscricao_id: number
  maior_dor_inicio: string
  principal_expectativa: string
  curso?: Curso
  usuario?: UsuarioBase
  createdAt?: string
  updatedAt?: string
}

/** Payload do POST /questionarios-iniciais (validado por QuestionarioInicialSchema no backend). */
export type CreateQuestionarioInicialRequest = {
  tenant_id?: number
  curso_id: number
  aluno_id?: number
  maior_dor_inicio: string
  principal_expectativa: string
}
