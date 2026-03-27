import { useEffect, useState } from 'react'
import { RefreshCcw, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

import { AlunoUserForm, AlunoUsersFilters, AlunoUsersList } from '../components'
import { Button } from '../components/ui/Button'
import { PaginationFooter } from '../components/ui/PaginationFooter'
import type { AlunoUsersFilterValue } from '../components/alunoUsers/AlunoUsersFilters'
import { authService, usuarioService } from '../services'
import { stripTenantScope } from '../services/tenantScope'
import type {
  Aluno,
  CreateAlunoRequest,
  PaginacaoApi,
  UpdateAlunoRequest,
  UsuarioListQuery,
} from '../types'
import { resolveTenantSlugFromBrowser } from '../utils'

export function AlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [pagination, setPagination] = useState<PaginacaoApi | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<AlunoUsersFilterValue>({
    nome: '',
    username: '',
    email: '',
    status: 'all',
  })
  const activeTenantSlug = authService.getSession()?.tenantSlug ?? resolveTenantSlugFromBrowser()

  function buildQuery(currentFilters: AlunoUsersFilterValue, page = currentPage): UsuarioListQuery {
    return stripTenantScope({
      page,
      limit: 10,
      nome: currentFilters.nome.trim() || undefined,
      username: currentFilters.username.trim() || undefined,
      email: currentFilters.email.trim() || undefined,
      status:
        currentFilters.status === 'all'
          ? undefined
          : currentFilters.status === 'active'
            ? 'true'
            : 'false',
    })
  }

  async function loadAlunos(currentFilters = filters, page = currentPage) {
    setIsLoading(true)
    try {
      const response = await usuarioService.listarAlunos(buildQuery(currentFilters, page))
      const payload = response.data

      setAlunos(payload.data)
      setPagination(payload.paginacao)
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Nao foi possivel carregar a lista de alunos.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadAlunos(filters, currentPage)
  }, [currentPage])

  async function handleSubmit(payload: CreateAlunoRequest | UpdateAlunoRequest) {
    if (!activeTenantSlug) {
      if (import.meta.env.DEV) {
        toast.error('Tenant ativo nao identificado. Faca login novamente.')
      }
      return
    }

    setIsSubmitting(true)
    try {
      const safePayload = stripTenantScope(payload)
      if (selectedAluno) {
        await usuarioService.atualizarAluno(selectedAluno.id, safePayload as UpdateAlunoRequest)
        if (import.meta.env.DEV) {
          toast.success('Aluno atualizado com sucesso.')
        }
      } else {
        await usuarioService.criarAluno(safePayload as CreateAlunoRequest)
        if (import.meta.env.DEV) {
          toast.success('Aluno cadastrado com sucesso.')
        }
      }

      setSelectedAluno(null)
      setIsFormOpen(false)
      await loadAlunos(filters, currentPage)
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Erro ao salvar aluno.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(aluno: Aluno) {
    const confirmed = window.confirm(
      `Deseja excluir o aluno "${aluno.perfil_aluno?.nome_completo || aluno.nome_completo || aluno.username}"?`,
    )

    if (!confirmed) {
      return
    }

    try {
      await usuarioService.deletarUsuario(aluno.id)
      if (import.meta.env.DEV) {
        toast.success('Aluno excluido com sucesso.')
      }
      await loadAlunos(filters, currentPage)
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Nao foi possivel excluir o aluno.')
      }
    }
  }

  return (
    <section className="scrollbar-hide flex h-full min-h-0 flex-1 flex-col gap-6 overflow-y-auto md:gap-8">
      <div className="shrink-0 space-y-6">
        <div className="flex flex-col gap-4 px-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
              Base de Alunos
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Gestao de alunos cadastrados, com filtros e edicao rapida.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                void loadAlunos(filters)
              }}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-indigo-900 dark:hover:text-indigo-300"
              title="Sincronizar dados"
              aria-label="Sincronizar dados"
            >
              <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <Button
              type="button"
              startIcon={isLoading ? <RefreshCcw size={18} className="animate-spin" /> : <UserPlus size={18} />}
              onClick={() => {
                setSelectedAluno(null)
                setIsFormOpen(true)
              }}
              className="rounded-2xl px-6 py-3 text-sm font-bold shadow-xl shadow-indigo-200/40 dark:shadow-indigo-950/40"
            >
              Cadastrar Aluno
            </Button>
          </div>
        </div>

        <AlunoUsersFilters
          value={filters}
          isLoading={isLoading}
          onChange={setFilters}
          onSearch={() => {
            if (currentPage === 1) {
              void loadAlunos(filters, 1)
            } else {
              setCurrentPage(1)
            }
          }}
          onClear={() => {
            const cleared: AlunoUsersFilterValue = {
              nome: '',
              username: '',
              email: '',
              status: 'all',
            }
            setFilters(cleared)
            if (currentPage === 1) {
              void loadAlunos(cleared, 1)
            } else {
              setCurrentPage(1)
            }
          }}
        />

        {pagination ? (
          <div className="inline-flex w-fit items-center px-1 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {pagination.total} {pagination.total === 1 ? 'Aluno Cadastrado' : 'Alunos Cadastrados'}
          </div>
        ) : null}
      </div>

      <AlunoUserForm
        isOpen={isFormOpen}
        selectedAluno={selectedAluno}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onClose={() => {
          setSelectedAluno(null)
          setIsFormOpen(false)
        }}
      />

      <AlunoUsersList
        alunos={alunos}
        isLoading={isLoading}
        onEdit={(aluno) => {
          setSelectedAluno(aluno)
          setIsFormOpen(true)
        }}
        onDelete={handleDelete}
      />

      {pagination ? (
        <PaginationFooter
          total={pagination.total}
          currentPage={pagination.pagina}
          totalPages={pagination.total_paginas}
          itemLabelSingular="aluno"
          itemLabelPlural="alunos"
          onPageChange={(page) => {
            setCurrentPage(page)
          }}
        />
      ) : null}
    </section>
  )
}
