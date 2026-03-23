import { api } from './api'
import type {
  CreateQuestionarioInicialRequest,
  QuestionarioInicial,
} from '../types'

export const questionarioInicialService = {
  enviarOuAtualizarQuestionario(payload: CreateQuestionarioInicialRequest) {
    return api.post<QuestionarioInicial>('/questionarios-iniciais', payload)
  },

  buscarQuestionarioPorCurso(cursoId: number) {
    return api.get<QuestionarioInicial>(`/questionarios-iniciais/${cursoId}`)
  },
}
