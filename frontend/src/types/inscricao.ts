import type { Curso } from './curso'
import type { TenantScopedQuery } from './tenant'
import type { Aluno } from './usuario'

export type Inscricao = {
  id: number
  tenant_id?: number
  curso_id: number
  aluno_id: number
  status_pagamento?: 'PENDENTE' | 'APROVADO' | 'REPROVADO' | string
  data_inscricao?: string
  presenca_confirmada?: boolean
  created_at?: string
  updated_at?: string
  createdAt?: string
  updatedAt?: string
  curso?: Curso
}

export type CursoComInscritos = Curso & {
  alunos_inscritos?: (Aluno & {
    // Compatibilidade com nome manual no frontend
    inscricao?: {
      id: number
      data_inscricao?: string
      presenca_confirmada?: boolean
      created_at?: string
      updated_at?: string
    }
    // Sequelize through padrão (model name)
    Inscricao?: {
      id: number
      data_inscricao?: string
      presenca_confirmada?: boolean
      created_at?: string
      updated_at?: string
    }
  })[]
}

export type CreateInscricaoRequest = {
  tenant_id?: number
  tenant_slug?: string
  curso_id: number
  aluno_id?: number
}

export type ConfirmarPresencaRequest = {
  curso_id: number
}

export type MinhasInscricoesResponse = Curso[]

export type InscricoesPorCursoResponse = CursoComInscritos

/** GET /inscricoes/contagem — admin; filtros opcionais alinhados ao backend. */
export type InscricaoContagemQuery = TenantScopedQuery & {
  curso_id?: number
  aluno_id?: number
  /** YYYY-MM-DD — apenas esse dia em `created_at` */
  created_at?: string
  created_at_inicio?: string
  created_at_fim?: string
}

export type InscricaoContagemResponse = {
  total: number
}
