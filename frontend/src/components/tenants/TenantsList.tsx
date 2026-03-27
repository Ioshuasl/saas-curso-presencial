import { CheckCircle2, LogIn, Pencil, Trash2, XCircle } from 'lucide-react'

import type { Tenant } from '../../types'

type TenantsListProps = {
  tenants: Tenant[]
  isLoading: boolean
  onEdit: (tenant: Tenant) => void
  onDelete: (tenant: Tenant) => void
  onAccessTenant: (tenant: Tenant) => void
}

export function TenantsList({
  tenants,
  isLoading,
  onEdit,
  onDelete,
  onAccessTenant,
}: TenantsListProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        Carregando tenants...
      </div>
    )
  }

  if (!tenants.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        Nenhum tenant encontrado.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="space-y-3 md:hidden">
        {tenants.map((tenant) => (
          <article
            key={tenant.id}
            role="button"
            tabIndex={0}
            onClick={() => onEdit(tenant)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onEdit(tenant)
              }
            }}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {tenant.nome}
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {tenant.slug || 'Slug não definido'}
                </p>
              </div>
              <span
                className={`inline-flex items-center ${
                  tenant.ativo ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                }`}
                aria-label={tenant.ativo ? 'Tenant ativo' : 'Tenant inativo'}
                title={tenant.ativo ? 'Ativo' : 'Inativo'}
              >
                {tenant.ativo ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onAccessTenant(tenant)
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-900/70 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
                aria-label="Acessar software do tenant"
                title="Acessar tenant"
              >
                <LogIn size={16} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onEdit(tenant)
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300"
                aria-label="Editar tenant"
                title="Editar"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onDelete(tenant)
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/70 dark:text-rose-300 dark:hover:bg-rose-900/20"
                aria-label="Excluir tenant"
                title="Excluir"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tenants.map((tenant) => (
                <tr
                  key={tenant.id}
                  onClick={() => onEdit(tenant)}
                  className="cursor-pointer transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                    {tenant.nome}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {tenant.slug || 'Slug não definido'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center ${
                        tenant.ativo ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                      }`}
                      aria-label={tenant.ativo ? 'Tenant ativo' : 'Tenant inativo'}
                      title={tenant.ativo ? 'Ativo' : 'Inativo'}
                    >
                      {tenant.ativo ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onAccessTenant(tenant)
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-900/70 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
                        aria-label="Acessar software do tenant"
                        title="Acessar tenant"
                      >
                        <LogIn size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onEdit(tenant)
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300"
                        aria-label="Editar tenant"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onDelete(tenant)
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/70 dark:text-rose-300 dark:hover:bg-rose-900/20"
                        aria-label="Excluir tenant"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

