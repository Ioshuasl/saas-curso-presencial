import { api } from './api'
import type {
  ApiMessageResponse,
  CreateInscricaoRequest,
  Inscricao,
  MinhasInscricoesResponse,
} from '../types'

export const inscricaoService = {
  listarMinhasInscricoes() {
    return api.get<MinhasInscricoesResponse>('/minhas-inscricoes')
  },

  criarInscricao(payload: CreateInscricaoRequest) {
    return api.post<Inscricao>('/inscricoes', payload)
  },

  confirmarPresenca(cursoId: number) {
    return api.post<ApiMessageResponse>(
      `/inscricoes/${cursoId}/confirmar-presenca`,
      { curso_id: cursoId },
    )
  },

  removerInscricao(cursoId: number) {
    return api.delete<ApiMessageResponse>(`/inscricoes/${cursoId}`)
  },
}
