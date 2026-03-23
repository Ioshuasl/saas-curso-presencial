import { api } from './api'
import type {
  ApiMessageResponse,
  ContaPagar,
  ContaPagarListQuery,
  ContaPagarListResponse,
  CreateContaPagarRequest,
  UpdateContaPagarRequest,
} from '../types'

export const contaPagarService = {
  listarContasPagar(params?: ContaPagarListQuery) {
    return api.get<ContaPagarListResponse>('/contas-pagar', { params })
  },

  buscarContaPagarPorId(id: number) {
    return api.get<ContaPagar>(`/contas-pagar/${id}`)
  },

  criarContaPagar(payload: CreateContaPagarRequest) {
    return api.post<ContaPagar>('/contas-pagar', payload)
  },

  atualizarContaPagar(id: number, payload: UpdateContaPagarRequest) {
    return api.put<ContaPagar>(`/contas-pagar/${id}`, payload)
  },

  deletarContaPagar(id: number) {
    return api.delete<ApiMessageResponse>(`/contas-pagar/${id}`)
  },
}
