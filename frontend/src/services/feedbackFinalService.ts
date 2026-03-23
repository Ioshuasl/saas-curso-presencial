import { api } from './api'
import type { CreateFeedbackFinalRequest, FeedbackFinal } from '../types'

export const feedbackFinalService = {
  enviarOuAtualizarFeedback(payload: CreateFeedbackFinalRequest) {
    return api.post<FeedbackFinal>('/feedbacks-finais', payload)
  },

  buscarFeedbackPorCurso(cursoId: number) {
    return api.get<FeedbackFinal>(`/feedbacks-finais/${cursoId}`)
  },
}
