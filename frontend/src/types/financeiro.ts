import type { TenantScopedQuery } from './tenant'

export type FinanceTransaction = {
  id: number
  descricao: string
  categoria?: string | null
  valor: number
  dataVencimento?: string | null
  dataLancamento?: string | null
  status: string
  observacoes?: string | null
  type: 'INCOME' | 'EXPENSE'
  hasLink?: boolean
}

export type FinanceiroListQuery = TenantScopedQuery & {
  limit?: number
  dataInicio?: string
  dataFim?: string
  status?: string
  categoria?: string
}

export type FinanceiroListResponse = FinanceTransaction[]

/** Query opcional para totais (mesmo padrão de período que `/transactions`). */
export type FinanceiroTotaisQuery = TenantScopedQuery & {
  dataInicio?: string
  dataFim?: string
}

export type FinanceiroTotalValorResponse = {
  valor_total: number
}

