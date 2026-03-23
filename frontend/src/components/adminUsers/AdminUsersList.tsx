import { Pencil, Trash2 } from 'lucide-react'

import type { AdminListItem } from '../../types'

type AdminUsersListProps = {
  admins: AdminListItem[]
  isLoading: boolean
  onEdit: (admin: AdminListItem) => void
  onDelete: (admin: AdminListItem) => void
}

export function AdminUsersList({
  admins,
  isLoading,
  onEdit,
  onDelete,
}: AdminUsersListProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        Carregando administradores...
      </div>
    )
  }

  if (!admins.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        Nenhum administrador encontrado.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {admins.map((admin) => (
        <article
          key={admin.id}
          className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[minmax(0,1fr)_auto]"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {admin.perfil_admin?.nome_completo || admin.username}
              </h3>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  admin.status
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                }`}
              >
                {admin.status ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            <p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-300">
              {admin.email}
            </p>
            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
              @{admin.username}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onEdit(admin)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Editar administrador"
              title="Editar"
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(admin)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/70 dark:text-rose-300 dark:hover:bg-rose-900/20"
              aria-label="Excluir administrador"
              title="Excluir"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
