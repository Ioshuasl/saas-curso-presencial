import { api } from './api'
import { getAuthSession } from './authToken'
import { stripTenantScope } from './tenantScope'
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

function toCursoFormData(payload: CreateCursoRequest | UpdateCursoRequest) {
  const safePayload = stripTenantScope(payload)
  const formData = new FormData()

  if (safePayload.nome != null) {
    formData.append('nome', String(safePayload.nome))
  }
  if (safePayload.ministrante != null) {
    formData.append('ministrante', String(safePayload.ministrante))
  }
  if (safePayload.valor != null) {
    formData.append('valor', String(safePayload.valor))
  }
  if (safePayload.vagas != null) {
    formData.append('vagas', String(safePayload.vagas))
  }
  if (safePayload.local != null) {
    formData.append('local', String(safePayload.local))
  }

  if (typeof safePayload.status === 'boolean') {
    formData.append('status', String(safePayload.status))
  }

  if (safePayload.descricao) {
    formData.append('descricao', safePayload.descricao)
  }

  if (safePayload.conteudo) {
    formData.append('conteudo', safePayload.conteudo)
  }

  if (safePayload.imagem) {
    formData.append('imagem', safePayload.imagem)
  }

  if (Array.isArray(safePayload.sessoes) && safePayload.sessoes.length > 0) {
    formData.append('sessoes', JSON.stringify(safePayload.sessoes))
  }

  if ('url_imagem' in safePayload && safePayload.url_imagem === null) {
    formData.append('url_imagem', '')
  }

  /** POST /cursos valida tenant no body (Zod); multipart não herda headers para o parse. */
  const session = getAuthSession()
  if (session?.tenantSlug) {
    formData.append('tenant_slug', session.tenantSlug)
  } else if (session?.tenantId != null) {
    formData.append('tenant_id', String(session.tenantId))
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
    const body = toCursoFormData(payload)
    return api.put<Curso>(`/cursos/${id}`, body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  deletarCurso(id: number) {
    return api.delete<ApiMessageResponse>(`/cursos/${id}`)
  },

  listarAlunosDoCurso(id: number) {
    return api.get<CursoAlunosResponse>(`/cursos/${id}/alunos`)
  },
}
