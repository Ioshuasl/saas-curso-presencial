import { api } from './api'
import { stripTenantScope } from './tenantScope'
import type {
  FinanceTransaction,
  FinanceiroListQuery,
  FinanceiroListResponse,
  FinanceiroTotalValorResponse,
  FinanceiroTotaisQuery,
} from '../types'

type FinanceiroApiPayload =
  | FinanceiroListResponse
  | {
      data: FinanceiroListResponse
      paginacao?: {
        total?: number
        total_paginas?: number
        pagina?: number
        por_pagina?: number
      }
    }

function unwrapTransactions(payload: FinanceiroApiPayload): FinanceiroListResponse {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

export const financeiroService = {
  listarTransacoes(params?: FinanceiroListQuery) {
    return api.get<FinanceiroApiPayload>('/transactions', {
      params: params ? stripTenantScope(params) : undefined,
    }).then((res) => ({
      ...res,
      data: unwrapTransactions(res.data),
    }))
  },
  buscarTransacaoPorId(id: number) {
    // Endpoint de detalhe não existe no backend unificado por enquanto.
    // Mantemos este método para compatibilidade futura; por enquanto retorna lista filtrada no frontend.
    return api
      .get<FinanceiroApiPayload>('/transactions', {
        params: stripTenantScope({ limit: 50 }),
      })
      .then((res) => unwrapTransactions(res.data).find((t) => t.id === id) as FinanceTransaction)
  },

  /** Soma de `valor_total` nas contas a receber (receita). Período opcional: data de lançamento (`created_at` no backend). */
  totalContasReceber(params?: FinanceiroTotaisQuery) {
    return api.get<FinanceiroTotalValorResponse>('/totais/receber', {
      params: params ? stripTenantScope(params) : undefined,
    })
  },

  /** Soma de `valor` nas contas a pagar (despesas). Período opcional: `data_vencimento` no backend. */
  totalContasPagar(params?: FinanceiroTotaisQuery) {
    return api.get<FinanceiroTotalValorResponse>('/totais/pagar', {
      params: params ? stripTenantScope(params) : undefined,
    })
  },
}

