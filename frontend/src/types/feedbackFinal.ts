import type { Curso } from './curso'
import type { UsuarioBase } from './usuario'

export type FeedbackFinal = {
  id: number
  tenant_id?: number
  curso_id: number
  usuario_id: number
  nota: number
  depoimento?: string | null
  impacto?: string | null
  curso?: Curso
  usuario?: UsuarioBase
  createdAt?: string
  updatedAt?: string
}

export type CreateFeedbackFinalRequest = {
  tenant_id?: number
  curso_id: number
  nota: number
  depoimento?: string
  impacto?: string
}
