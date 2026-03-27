import { useEffect, useState } from 'react'
import { RefreshCcw, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '../components/ui/Button'
import { PaginationFooter } from '../components/ui/PaginationFooter'
import { AdminUserForm, AdminUsersFilters, AdminUsersList } from '../components'
import { authService, usuarioService } from '../services'
import { stripTenantScope } from '../services/tenantScope'
import type {
  AdminListItem,
  UsuarioListQuery,
  CreateAdminRequest,
  PaginacaoApi,
  UpdateAdminRequest,
} from '../types'
import type { AdminUsersFilterValue } from '../components/adminUsers/AdminUsersFilters'
import { resolveTenantSlugFromBrowser } from '../utils'

export function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminListItem[]>([])
  const [pagination, setPagination] = useState<PaginacaoApi | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<AdminListItem | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<AdminUsersFilterValue>({
    nome: '',
    username: '',
    email: '',
    status: 'all',
  })
  const activeTenantSlug = authService.getSession()?.tenantSlug ?? resolveTenantSlugFromBrowser()

  function buildQuery(currentFilters: AdminUsersFilterValue, page = currentPage): UsuarioListQuery {
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

  async function loadAdmins(currentFilters = filters, page = currentPage) {
    setIsLoading(true)
    try {
      const response = await usuarioService.listarAdmins(buildQuery(currentFilters, page))
      setAdmins(response.data.data)
      setPagination(response.data.paginacao)
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Nao foi possivel carregar a lista de administradores.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadAdmins(filters, currentPage)
  }, [currentPage])

  async function handleSubmit(payload: CreateAdminRequest | UpdateAdminRequest) {
    if (!activeTenantSlug) {
      if (import.meta.env.DEV) {
        toast.error('Tenant ativo nao identificado. Faca login novamente.')
      }
      return
    }

    setIsSubmitting(true)
    try {
      const safePayload = stripTenantScope(payload)
      if (selectedAdmin) {
        await usuarioService.atualizarAdmin(selectedAdmin.id, safePayload as UpdateAdminRequest)
        if (import.meta.env.DEV) {
          toast.success('Administrador atualizado com sucesso.')
        }
      } else {
        await usuarioService.criarAdmin(safePayload as CreateAdminRequest)
        if (import.meta.env.DEV) {
          toast.success('Administrador cadastrado com sucesso.')
        }
      }

      setSelectedAdmin(null)
      setIsFormOpen(false)
      await loadAdmins(filters, currentPage)
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Erro ao salvar administrador.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(admin: AdminListItem) {
    const confirmed = window.confirm(
      `Deseja excluir o administrador "${admin.perfil_admin?.nome_completo || admin.username}"?`,
    )

    if (!confirmed) {
      return
    }

    try {
      await usuarioService.deletarUsuario(admin.id)
      if (import.meta.env.DEV) {
        toast.success('Administrador excluido com sucesso.')
      }
      await loadAdmins(filters, currentPage)
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Nao foi possivel excluir o administrador.')
      }
    }
  }

  return (
    <section className="scrollbar-hide flex h-full min-h-0 flex-1 flex-col gap-6 overflow-y-auto md:gap-8">
      <div className="shrink-0 space-y-6">
        <div className="flex flex-col gap-4 px-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
              Base de Administradores
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Gestao de administradores cadastrados, com filtros e edicao rapida.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                void loadAdmins(filters)
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
              Cadastrar Administrador
            </Button>
          </div>
        </div>

        <AdminUsersFilters
          value={filters}
          isLoading={isLoading}
          onChange={setFilters}
          onSearch={() => {
            if (currentPage === 1) {
              void loadAdmins(filters, 1)
            } else {
              setCurrentPage(1)
            }
          }}
          onClear={() => {
            const cleared: AdminUsersFilterValue = {
              nome: '',
              username: '',
              email: '',
              status: 'all',
            }
            setFilters(cleared)
            if (currentPage === 1) {
              void loadAdmins(cleared, 1)
            } else {
              setCurrentPage(1)
            }
          }}
        />

        {pagination ? (
          <div className="inline-flex w-fit items-center px-1 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {pagination.total}{' '}
            {pagination.total === 1 ? 'Administrador Cadastrado' : 'Administradores Cadastrados'}
          </div>
        ) : null}
      </div>

      <AdminUserForm
        isOpen={isFormOpen}
        selectedAdmin={selectedAdmin}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onClose={() => {
          setSelectedAdmin(null)
          setIsFormOpen(false)
        }}
      />

      <AdminUsersList
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
          itemLabelSingular="administrador"
          itemLabelPlural="administradores"
          onPageChange={(page) => {
            setCurrentPage(page)
          }}
        />
      ) : null}
    </section>
  )
}
