import { api } from './api'
import { stripTenantScope } from './tenantScope'
import type {
  ApiMessageResponse,
  ContaReceber,
  ContaReceberListQuery,
  ContaReceberListResponse,
  CreateContaReceberRequest,
  MarcarParcelaPagaRequest,
  UpdateContaReceberRequest,
} from '../types'

export const contaReceberService = {
  listarContasReceber(params?: ContaReceberListQuery) {
    return api.get<ContaReceberListResponse>('/contas-receber', {
      params: params ? stripTenantScope(params) : undefined,
    })
  },

  buscarContaReceberPorId(id: number) {
    return api.get<ContaReceber>(`/contas-receber/${id}`)
  },

  criarContaReceber(payload: CreateContaReceberRequest) {
    return api.post<ContaReceber>('/contas-receber', stripTenantScope(payload))
  },

  atualizarContaReceber(id: number, payload: UpdateContaReceberRequest) {
    return api.put<ContaReceber>(`/contas-receber/${id}`, stripTenantScope(payload))
  },

  deletarContaReceber(id: number) {
    return api.delete<ApiMessageResponse>(`/contas-receber/${id}`)
  },

  marcarParcelaComoPaga(
    id: number,
    parcelaId: number,
    payload?: MarcarParcelaPagaRequest,
  ) {
    return api.post<ContaReceber>(
      `/contas-receber/${id}/parcelas/${parcelaId}/pagar`,
      payload,
    )
  },
}
