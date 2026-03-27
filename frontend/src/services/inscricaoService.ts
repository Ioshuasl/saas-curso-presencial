import { api } from './api'
import { stripTenantScope } from './tenantScope'
import type {
  CreateInscricaoRequest,
  Inscricao,
  InscricaoContagemQuery,
  InscricaoContagemResponse,
  InscricoesPorCursoResponse,
  MinhasInscricoesResponse,
} from '../types'

export const inscricaoService = {
  listarMinhasInscricoes() {
    return api.get<MinhasInscricoesResponse>('/minhas-inscricoes')
  },

  listarInscricoesPorCurso(cursoId: number) {
    return api.get<InscricoesPorCursoResponse>(`/inscricoes/curso/${cursoId}`)
  },

  /** Total de inscrições no tenant (admin). Query opcional: curso_id, aluno_id, created_at, created_at_inicio, created_at_fim. */
  contarInscricoes(params?: InscricaoContagemQuery) {
    return api.get<InscricaoContagemResponse>('/inscricoes/contagem', {
      params: params ? stripTenantScope(params) : undefined,
    })
  },

  criarInscricao(payload: CreateInscricaoRequest) {
    return api.post<Inscricao>('/inscricoes', stripTenantScope(payload))
  },

  confirmarPresenca(cursoId: number) {
    return api.post<Inscricao>(
      `/inscricoes/${cursoId}/confirmar-presenca`,
      { curso_id: cursoId },
    )
  },

  removerInscricao(cursoId: number) {
    return api.delete<void>(`/inscricoes/${cursoId}`)
  },
}
