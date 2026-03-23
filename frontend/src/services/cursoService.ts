import { api } from './api'
import type {
  ApiMessageResponse,
  Curso,
  CursoAlunosResponse,
  CursoByDateQuery,
  CursoListQuery,
  CursoListResponse,
  CursoVagasResponse,
  CreateCursoRequest,
  UpdateCursoRequest,
} from '../types'

function toCursoFormData(payload: CreateCursoRequest) {
  const formData = new FormData()

  formData.append('nome', payload.nome)
  formData.append('ministrante', payload.ministrante)
  formData.append('valor', String(payload.valor))
  formData.append('vagas', String(payload.vagas))
  formData.append('local', payload.local)

  if (typeof payload.status === 'boolean') {
    formData.append('status', String(payload.status))
  }

  if (payload.descricao) {
    formData.append('descricao', payload.descricao)
  }

  if (payload.conteudo) {
    formData.append('conteudo', payload.conteudo)
  }

  if (payload.imagem) {
    formData.append('imagem', payload.imagem)
  }

  return formData
}

export const cursoService = {
  listarCursos(params?: CursoListQuery) {
    return api.get<CursoListResponse>('/cursos', { params })
  },

  buscarCursoPorId(id: number) {
    return api.get<Curso>(`/cursos/${id}`)
  },

  consultarVagas(id: number) {
    return api.get<CursoVagasResponse>(`/cursos/${id}/vagas`)
  },

  listarCursosPorData(params: CursoByDateQuery) {
    return api.get<Curso[]>('/cursos/por-data', { params })
  },

  listarMeusCursos() {
    return api.get<Curso[]>('/cursos/meus')
  },

  criarCurso(payload: CreateCursoRequest) {
    const body = toCursoFormData(payload)
    return api.post<Curso>('/cursos', body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  atualizarCurso(id: number, payload: UpdateCursoRequest) {
    return api.put<Curso>(`/cursos/${id}`, payload)
  },

  deletarCurso(id: number) {
    return api.delete<ApiMessageResponse>(`/cursos/${id}`)
  },

  listarAlunosDoCurso(id: number) {
    return api.get<CursoAlunosResponse>(`/cursos/${id}/alunos`)
  },
}
