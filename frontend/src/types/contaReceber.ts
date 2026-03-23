import type { PaginatedResponse } from './usuario'

export type ParcelaContaReceber = {
  id: number
  numero: number
  valor: number
  data_vencimento: string
  data_pagamento?: string | null
  status: 'PENDENTE' | 'PAGO' | 'VENCIDO' | string
}

export type ContaReceber = {
  id: number
  descricao: string
  valor_total: number
  categoria?: string | null
  status: 'PENDENTE' | 'PAGO' | 'PARCIAL' | string
  parcelas?: ParcelaContaReceber[]
  observacoes?: string | null
  createdAt?: string
  updatedAt?: string
}

export type ContaReceberListQuery = {
  page?: number
  limit?: number
  search?: string
  status?: string
  categoria?: string
  dataInicio?: string
  dataFim?: string
}

export type CreateParcelaContaReceberRequest = {
  numero: number
  valor: number
  data_vencimento: string
}

export type CreateContaReceberRequest = {
  descricao: string
  valor_total: number
  categoria?: string
  status?: 'PENDENTE' | 'PAGO' | 'PARCIAL'
  observacoes?: string
  parcelas: CreateParcelaContaReceberRequest[]
}

export type UpdateParcelaContaReceberRequest = Partial<CreateParcelaContaReceberRequest> & {
  id?: number
}

export type UpdateContaReceberRequest = Partial<
  Omit<CreateContaReceberRequest, 'parcelas'> & {
    parcelas: UpdateParcelaContaReceberRequest[]
  }
>

export type MarcarParcelaPagaRequest = {
  data_pagamento?: string
  valor_pago?: number
}

export type ContaReceberListResponse = PaginatedResponse<ContaReceber>
