import type { PaginatedResponse } from './usuario'

export type ContaPagar = {
  id: number
  descricao: string
  valor: number
  categoria?: string | null
  data_vencimento: string
  data_pagamento?: string | null
  status: 'PENDENTE' | 'PAGO' | 'VENCIDO' | string
  observacoes?: string | null
  createdAt?: string
  updatedAt?: string
}

export type ContaPagarListQuery = {
  page?: number
  limit?: number
  search?: string
  status?: string
  categoria?: string
  dataInicio?: string
  dataFim?: string
}

export type CreateContaPagarRequest = {
  descricao: string
  valor: number
  categoria?: string
  data_vencimento: string
  data_pagamento?: string
  status?: 'PENDENTE' | 'PAGO' | 'VENCIDO'
  observacoes?: string
}

export type UpdateContaPagarRequest = Partial<CreateContaPagarRequest>

export type ContaPagarListResponse = PaginatedResponse<ContaPagar>
