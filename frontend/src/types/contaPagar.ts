import type { PaginatedResponse } from './usuario'
import type { TenantScopedQuery } from './tenant'

export type ContaPagar = {
  id: number
  tenant_id?: number
  curso_id?: number | null
  descricao: string
  valor: number
  categoria?: string | null
  data_vencimento: string
  data_pagamento?: string | null
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO' | string
  observacao?: string | null
  createdAt?: string
  updatedAt?: string
}

export type ContaPagarListQuery = TenantScopedQuery & {
  page?: number
  limit?: number
  search?: string
  status?: string
  categoria?: string
  dataInicio?: string
  dataFim?: string
}

export type CreateContaPagarRequest = TenantScopedQuery & {
  curso_id?: number
  descricao: string
  valor: number
  categoria?: string
  data_vencimento: string
  data_pagamento?: string
  status?: 'PENDENTE' | 'PAGO' | 'ATRASADO'
  observacao?: string
}

export type UpdateContaPagarRequest = Partial<CreateContaPagarRequest>

export type ContaPagarListResponse = PaginatedResponse<ContaPagar>
