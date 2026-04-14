import { BookPlus, RefreshCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { CursoFilters, CursoForm, CursoList } from '../components'
import { Button } from '../components/ui/Button'
import { PaginationFooter } from '../components/ui/PaginationFooter'
import { cursoService } from '../services'
import type {
  CreateCursoRequest,
  Curso,
  CursoListQuery,
  PaginacaoApi,
  UpdateCursoRequest,
} from '../types'
import type { CursoFilterValue } from '../components/cursos/CursoFilters'

export function AdminCursoPage() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [pagination, setPagination] = useState<PaginacaoApi | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<CursoFilterValue>({
    nome: '',
    status: 'all',
  })

  function buildQuery(currentFilters: CursoFilterValue, page = currentPage): CursoListQuery {
    return {
      page,
      limit: 10,
      nome: currentFilters.nome.trim() || undefined,
      status:
        currentFilters.status === 'all'
          ? undefined
          : currentFilters.status === 'active'
            ? true
            : false,
    }
  }

  async function loadCursos(currentFilters = filters, page = currentPage) {
    setIsLoading(true)
    try {
      const response = await cursoService.listarCursos(buildQuery(currentFilters, page))
      setCursos(response.data.data)
      setPagination(response.data.paginacao)
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Não foi possível carregar a lista de cursos.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadCursos(filters, currentPage)
  }, [currentPage])

  async function handleSubmit(payload: CreateCursoRequest | UpdateCursoRequest) {
    setIsSubmitting(true)
    try {
      if (selectedCurso) {
        await cursoService.atualizarCurso(selectedCurso.id, payload as UpdateCursoRequest)
        if (import.meta.env.DEV) {
          toast.success('Curso atualizado com sucesso.')
        }
      } else {
        await cursoService.criarCurso(payload as CreateCursoRequest)
        if (import.meta.env.DEV) {
          toast.success('Curso cadastrado com sucesso.')
        }
      }

      setSelectedCurso(null)
      setIsFormOpen(false)
      await loadCursos(filters, currentPage)
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Erro ao salvar curso.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(curso: Curso) {
    const confirmed = window.confirm(`Deseja excluir o curso "${curso.nome}"?`)
    if (!confirmed) return

    try {
      await cursoService.deletarCurso(curso.id)
      if (import.meta.env.DEV) {
        toast.success('Curso excluído com sucesso.')
      }
      await loadCursos(filters, currentPage)
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Não foi possível excluir o curso.')
      }
    }
  }

  return (
    <section className="scrollbar-hide flex h-full min-h-0 flex-1 flex-col gap-6 overflow-y-auto md:gap-8">
      <div className="shrink-0 space-y-6">
        <div className="flex flex-col gap-4 px-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
              Base de Cursos
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Gestão de cursos cadastrados, com filtros e edição rápida.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                void loadCursos(filters)
              }}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-indigo-900 dark:hover:text-indigo-300"
              title="Sincronizar dados"
              aria-label="Sincronizar dados"
            >
              <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <Button
              type="button"
              startIcon={isLoading ? <RefreshCcw size={18} className="animate-spin" /> : <BookPlus size={18} />}
              onClick={() => {
                setSelectedCurso(null)
                setIsFormOpen(true)
              }}
              className="rounded-2xl px-6 py-3 text-sm font-bold shadow-xl shadow-indigo-200/40 dark:shadow-indigo-950/40"
            >
              Cadastrar Curso
            </Button>
          </div>
        </div>

        <CursoFilters
          value={filters}
          isLoading={isLoading}
          onChange={setFilters}
          onSearch={() => {
            if (currentPage === 1) {
              void loadCursos(filters, 1)
            } else {
              setCurrentPage(1)
            }
          }}
          onClear={() => {
            const cleared: CursoFilterValue = {
              nome: '',
              status: 'all',
            }
            setFilters(cleared)
            if (currentPage === 1) {
              void loadCursos(cleared, 1)
            } else {
              setCurrentPage(1)
            }
          }}
        />

        {pagination ? (
          <div className="inline-flex w-fit items-center px-1 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {pagination.total} {pagination.total === 1 ? 'Curso Cadastrado' : 'Cursos Cadastrados'}
          </div>
        ) : null}
      </div>

      <CursoForm
        isOpen={isFormOpen}
        selectedCurso={selectedCurso}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onClose={() => {
          setSelectedCurso(null)
          setIsFormOpen(false)
        }}
      />

      <CursoList
        cursos={cursos}
        isLoading={isLoading}
        onEdit={(curso) => {
          void (async () => {
            try {
              const response = await cursoService.buscarCursoPorId(curso.id)
              setSelectedCurso(response.data)
            } catch {
              // fallback para o item já carregado na listagem, caso falhe a busca detalhada
              setSelectedCurso(curso)
            } finally {
              setIsFormOpen(true)
            }
          })()
        }}
        onDelete={handleDelete}
      />

      {pagination ? (
        <PaginationFooter
          total={pagination.total}
          currentPage={pagination.pagina}
          totalPages={pagination.total_paginas}
          itemLabelSingular="curso"
          itemLabelPlural="cursos"
          onPageChange={(page) => {
            setCurrentPage(page)
          }}
        />
      ) : null}
    </section>
  )
}
