import type { PaginatedResponse } from './usuario'
import type { TenantScopedQuery } from './tenant'

export type ParcelaContaReceber = {
  id?: number
  tenant_id?: number
  numero_parcela: number
  // compatibilidade com payloads antigos (caso algum lugar envie `numero`)
  numero?: number
  valor: number
  data_vencimento: string
  pago?: boolean
  data_pagamento?: string | null
}

export type ContaReceber = {
  id: number
  tenant_id?: number
  aluno_id?: number
  curso_id?: number
  forma_pagamento?: 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | string
  descricao?: string
  valor_total: number
  categoria?: string | null
  status?: 'PENDENTE' | 'PAGO' | 'PARCIAL' | string
  parcelas_pagas?: number
  parcelas_total?: number
  parcelas?: ParcelaContaReceber[]
  observacao?: string | null
  createdAt?: string
  updatedAt?: string
}

export type ContaReceberListQuery = TenantScopedQuery & {
  page?: number
  limit?: number
  search?: string
  status?: string
  categoria?: string
  dataInicio?: string
  dataFim?: string
}

export type CreateParcelaContaReceberRequest = {
  numero_parcela: number
  // compatibilidade
  numero?: number
  valor: number
  data_vencimento: string
  pago?: boolean
  data_pagamento?: string
}

export type CreateContaReceberRequest = {
  tenant_id?: number
  tenant_slug?: string
  aluno_id: number
  curso_id: number
  forma_pagamento: 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO'
  descricao?: string
  valor_total: number
  observacao?: string
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
