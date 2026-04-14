import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { TenantForm, TenantsList } from '../components'
import type { TenantFormMode } from '../components/tenants/TenantForm'
import { Button } from '../components/ui/Button'
import { authService, tenantService } from '../services'
import type {
  CreateFirstTenantAdminRequest,
  CreateTenantRequest,
  Tenant,
  TenantListQuery,
  UpdateTenantRequest,
} from '../types'

type TenantFilterValue = {
  nome: string
  status: 'all' | 'active' | 'inactive'
}

type TenantPagination = {
  total: number
  total_paginas: number
  pagina: number
  por_pagina: number
}

export function TenantsPage() {
  const navigate = useNavigate()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [pagination, setPagination] = useState<TenantPagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<TenantFormMode>('create_tenant')
  const [filters, setFilters] = useState<TenantFilterValue>({
    nome: '',
    status: 'all',
  })

  function buildQuery(currentFilters: TenantFilterValue): TenantListQuery {
    return {
      page: 1,
      limit: 10,
      nome: currentFilters.nome.trim() || undefined,
      ativo:
        currentFilters.status === 'all'
          ? undefined
          : currentFilters.status === 'active'
            ? 'true'
            : 'false',
    }
  }

  async function loadTenants(currentFilters = filters) {
    setIsLoading(true)
    try {
      const response = await tenantService.listarTenants(buildQuery(currentFilters))
      setTenants(response.data.data)
      setPagination(response.data.paginacao)
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Não foi possível carregar a lista de tenants.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadTenants()
  }, [])

  async function handleSubmit(
    payload: CreateTenantRequest | UpdateTenantRequest | CreateFirstTenantAdminRequest,
  ) {
    setIsSubmitting(true)
    try {
      if (formMode === 'create_first_admin') {
        if (!selectedTenant) {
          throw new Error('Tenant não identificado para criar o primeiro administrador.')
        }
        await tenantService.criarPrimeiroAdmin(selectedTenant.id, payload as CreateFirstTenantAdminRequest)
        if (import.meta.env.DEV) {
          toast.success('Primeiro administrador cadastrado com sucesso.')
        }
      } else if (formMode === 'edit_tenant' && selectedTenant) {
        await tenantService.atualizarTenant(selectedTenant.id, payload as UpdateTenantRequest)
        if (import.meta.env.DEV) {
          toast.success('Tenant atualizado com sucesso.')
        }
      } else {
        await tenantService.criarTenant(payload as CreateTenantRequest)
        if (import.meta.env.DEV) {
          toast.success('Tenant cadastrado com sucesso.')
        }
      }

      setSelectedTenant(null)
      setFormMode('create_tenant')
      setIsFormOpen(false)
      await loadTenants(filters)
    } catch (error) {
      if (import.meta.env.DEV) {
        const message =
          error instanceof Error && error.message
            ? error.message
            : 'Erro ao salvar tenant.'
        toast.error(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(tenant: Tenant) {
    const confirmed = window.confirm(`Deseja excluir o tenant "${tenant.nome}"?`)
    if (!confirmed) {
      return
    }

    try {
      await tenantService.deletarTenant(tenant.id)
      if (import.meta.env.DEV) {
        toast.success('Tenant excluído com sucesso.')
      }
      await loadTenants(filters)
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Não foi possível excluir o tenant.')
      }
    }
  }

  async function handleAccessTenant(tenant: Tenant) {
    if (!tenant.ativo) {
      if (import.meta.env.DEV) {
        toast.error('Tenant inativo. Ative o tenant antes de acessar o software.')
      }
      return
    }

    if (!tenant.slug) {
      if (import.meta.env.DEV) {
        toast.error('Tenant sem slug. Defina um slug para acessar o software.')
      }
      return
    }

    try {
      await authService.logout()
    } catch {
      // Mesmo com falha no endpoint de logout, precisamos limpar contexto local.
      authService.clearToken()
    }

    navigate(`/login?tenant_slug=${encodeURIComponent(tenant.slug)}`, { replace: true })
  }

  return (
    <section className="scrollbar-hide flex h-full min-h-0 flex-1 flex-col space-y-4 overflow-y-auto">
      <form
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3 dark:border-slate-800 dark:bg-slate-900"
        onSubmit={(event) => {
          event.preventDefault()
          void loadTenants(filters)
        }}
      >
        <label className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-300">
          <span>Nome</span>
          <input
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950"
            value={filters.nome}
            onChange={(event) => setFilters((prev) => ({ ...prev, nome: event.target.value }))}
            placeholder="Ex: Barbearia Exemplo"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-300">
          <span>Status</span>
          <select
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950"
            value={filters.status}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                status: event.target.value as TenantFilterValue['status'],
              }))
            }
          >
            <option value="all">Todos</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </label>

        <div className="flex items-end justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const cleared: TenantFilterValue = { nome: '', status: 'all' }
              setFilters(cleared)
              void loadTenants(cleared)
            }}
          >
            Limpar
          </Button>
          <Button type="submit">Buscar</Button>
        </div>
      </form>

      <div className="flex justify-end">
        <Button
          type="button"
          startIcon={<Plus size={16} />}
          onClick={() => {
            setSelectedTenant(null)
            setFormMode('create_tenant')
            setIsFormOpen(true)
          }}
        >
          Novo Tenant
        </Button>
      </div>

      <TenantForm
        isOpen={isFormOpen}
        mode={formMode}
        selectedTenant={selectedTenant}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onClose={() => {
          setSelectedTenant(null)
          setFormMode('create_tenant')
          setIsFormOpen(false)
        }}
      />

      <TenantsList
        tenants={tenants}
        isLoading={isLoading}
        onEdit={(tenant) => {
          setSelectedTenant(tenant)
          setFormMode('edit_tenant')
          setIsFormOpen(true)
        }}
        onCreateFirstAdmin={(tenant) => {
          setSelectedTenant(tenant)
          setFormMode('create_first_admin')
          setIsFormOpen(true)
        }}
        onDelete={handleDelete}
        onAccessTenant={handleAccessTenant}
      />

      {pagination ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Total: {pagination.total} tenant(s) - Página {pagination.pagina} de{' '}
          {pagination.total_paginas}
        </p>
      ) : null}
    </section>
  )
}

