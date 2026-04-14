import { useEffect, useState } from 'react'
import { RefreshCcw, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '../components/ui/Button'
import { PaginationFooter } from '../components/ui/PaginationFooter'
import { SaasAdminUserForm, SaasAdminUsersList } from '../components'
import { usuarioService } from '../services'
import type {
  CreateSaasAdminRequest,
  PaginacaoApi,
  SaasAdminListItem,
  UpdateSaasAdminRequest,
  UsuarioListQuery,
} from '../types'

type SaasAdminUsersFilterValue = {
  nome: string
  username: string
  email: string
  status: 'all' | 'active' | 'inactive'
}

export function SaasAdminUsersPage() {
  const [admins, setAdmins] = useState<SaasAdminListItem[]>([])
  const [pagination, setPagination] = useState<PaginacaoApi | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<SaasAdminListItem | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<SaasAdminUsersFilterValue>({
    nome: '',
    username: '',
    email: '',
    status: 'all',
  })

  function buildQuery(currentFilters: SaasAdminUsersFilterValue, page = currentPage): UsuarioListQuery {
    return {
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
    }
  }

  async function loadSaasAdmins(currentFilters = filters, page = currentPage) {
    setIsLoading(true)
    try {
      const response = await usuarioService.listarSaasAdmins(buildQuery(currentFilters, page))
      setAdmins(response.data.data)
      setPagination(response.data.paginacao)
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Não foi possível carregar a lista de usuários SaaS.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadSaasAdmins(filters, currentPage)
  }, [currentPage])

  async function handleSubmit(payload: CreateSaasAdminRequest | UpdateSaasAdminRequest) {
    setIsSubmitting(true)
    try {
      if (selectedAdmin) {
        await usuarioService.atualizarSaasAdmin(selectedAdmin.id, payload as UpdateSaasAdminRequest)
        if (import.meta.env.DEV) {
          toast.success('Usuário SaaS atualizado com sucesso.')
        }
      } else {
        await usuarioService.criarSaasAdmin(payload as CreateSaasAdminRequest)
        if (import.meta.env.DEV) {
          toast.success('Usuário SaaS cadastrado com sucesso.')
        }
      }

      setSelectedAdmin(null)
      setIsFormOpen(false)
      await loadSaasAdmins(filters, currentPage)
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Erro ao salvar usuário SaaS.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(admin: SaasAdminListItem) {
    const confirmed = window.confirm(
      `Deseja excluir o usuário SaaS "${admin.perfil_admin?.nome_completo || admin.username}"?`,
    )

    if (!confirmed) return

    try {
      await usuarioService.deletarSaasAdmin(admin.id)
      if (import.meta.env.DEV) {
        toast.success('Usuário SaaS excluído com sucesso.')
      }
      await loadSaasAdmins(filters, currentPage)
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Não foi possível excluir o usuário SaaS.')
      }
    }
  }

  return (
    <section className="scrollbar-hide flex h-full min-h-0 flex-1 flex-col gap-6 overflow-y-auto md:gap-8">
      <div className="shrink-0 space-y-6">
        <div className="flex flex-col gap-4 px-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
              Usuários SaaS
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Gestão de usuários com perfil SAAS_ADMIN.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                void loadSaasAdmins(filters, currentPage)
              }}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-indigo-900 dark:hover:text-indigo-300"
              title="Sincronizar dados"
              aria-label="Sincronizar dados"
            >
              <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <Button
              type="button"
              startIcon={
                isLoading ? <RefreshCcw size={18} className="animate-spin" /> : <UserPlus size={18} />
              }
              onClick={() => {
                setSelectedAdmin(null)
                setIsFormOpen(true)
              }}
              className="rounded-2xl px-6 py-3 text-sm font-bold shadow-xl shadow-indigo-200/40 dark:shadow-indigo-950/40"
            >
              Cadastrar Usuário SaaS
            </Button>
          </div>
        </div>

        <form
          className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4 dark:border-slate-800 dark:bg-slate-900"
          onSubmit={(event) => {
            event.preventDefault()
            if (currentPage === 1) {
              void loadSaasAdmins(filters, 1)
            } else {
              setCurrentPage(1)
            }
          }}
        >
          <input
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950"
            placeholder="Nome"
            value={filters.nome}
            onChange={(event) => setFilters((prev) => ({ ...prev, nome: event.target.value }))}
          />
          <input
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950"
            placeholder="Username"
            value={filters.username}
            onChange={(event) => setFilters((prev) => ({ ...prev, username: event.target.value }))}
          />
          <input
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950"
            placeholder="E-mail"
            value={filters.email}
            onChange={(event) => setFilters((prev) => ({ ...prev, email: event.target.value }))}
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const cleared: SaasAdminUsersFilterValue = {
                  nome: '',
                  username: '',
                  email: '',
                  status: 'all',
                }
                setFilters(cleared)
                if (currentPage === 1) {
                  void loadSaasAdmins(cleared, 1)
                } else {
                  setCurrentPage(1)
                }
              }}
            >
              Limpar
            </Button>
            <Button type="submit">Buscar</Button>
          </div>
        </form>

        {pagination ? (
          <div className="inline-flex w-fit items-center px-1 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {pagination.total} {pagination.total === 1 ? 'Usuário SaaS Cadastrado' : 'Usuários SaaS Cadastrados'}
          </div>
        ) : null}
      </div>

      <SaasAdminUserForm
        isOpen={isFormOpen}
        selectedAdmin={selectedAdmin}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onClose={() => {
          setSelectedAdmin(null)
          setIsFormOpen(false)
        }}
      />

      <SaasAdminUsersList
        admins={admins}
        isLoading={isLoading}
        onEdit={(admin) => {
          setSelectedAdmin(admin)
          setIsFormOpen(true)
        }}
        onDelete={handleDelete}
      />

      {pagination ? (
        <PaginationFooter
          total={pagination.total}
          currentPage={pagination.pagina}
          totalPages={pagination.total_paginas}
          itemLabelSingular="usuário SaaS"
          itemLabelPlural="usuários SaaS"
          onPageChange={(page) => {
            setCurrentPage(page)
          }}
        />
      ) : null}
    </section>
  )
}
