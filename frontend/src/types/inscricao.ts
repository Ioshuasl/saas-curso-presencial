import type { Curso } from './curso'

export type Inscricao = {
  id: number
  curso_id: number
  usuario_id: number
  status_pagamento?: 'PENDENTE' | 'APROVADO' | 'REPROVADO' | string
  presenca_confirmada?: boolean
  createdAt?: string
  updatedAt?: string
  curso?: Curso
}

export type CreateInscricaoRequest = {
  curso_id: number
  usuario_id?: number
}

export type ConfirmarPresencaRequest = {
  curso_id: number
}

export type MinhasInscricoesResponse = Curso[]
