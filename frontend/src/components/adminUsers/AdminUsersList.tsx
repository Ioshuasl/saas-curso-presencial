import { CheckCircle2, Pencil, Trash2, XCircle } from 'lucide-react'
import { cn } from '../../utils'

import type { AdminListItem } from '../../types'

type AdminUsersListProps = {
  admins: AdminListItem[]
  isLoading: boolean
  onEdit: (admin: AdminListItem) => void
  onDelete: (admin: AdminListItem) => void
  className?: string
}

export function AdminUsersList({
  admins,
  isLoading,
  onEdit,
  onDelete,
  className,
}: AdminUsersListProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-7 text-center text-sm font-semibold text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        Carregando administradores...
      </div>
    )
  }

  if (!admins.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-base font-black text-slate-500 dark:text-slate-300">
          Nenhum administrador encontrado
        </p>
        <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">
          Tente ajustar os filtros para buscar novamente.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('min-w-0 pr-1', className)}>
      <div className="grid grid-cols-1 gap-3">
      {admins.map((admin) => {
        const isActive = Boolean(admin.status)
        const adminNome = admin.perfil_admin?.nome_completo || admin.username
        const cpf = admin.cpf || '---'

        return (
          <article
            key={admin.id}
            role="button"
            tabIndex={0}
            onClick={() => onEdit(admin)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onEdit(admin)
              }
            }}
            className="group rounded-2xl border border-slate-200 bg-white transition-all hover:border-indigo-100 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900/60"
          >
            <div className="flex flex-col justify-between gap-4 p-4 md:flex-row md:items-center md:gap-5 md:p-5">
              <div className="flex min-w-0 items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-base font-black text-indigo-600 transition-all group-hover:bg-indigo-600 group-hover:text-white dark:bg-slate-800 dark:text-indigo-300">
                  {adminNome.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <h4 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100 md:text-base">
                    {adminNome}
                  </h4>
                  <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    @{admin.username}
                  </p>

                  <div className="mt-1.5 flex flex-wrap gap-3">
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                      CPF: {cpf}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                      Email: {admin.email}
                    </span>
                  </div>
                </div>

                <span
                  className={`ml-auto inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider md:hidden ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                  }`}
                >
                  {isActive ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                  {isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <span
                className={`hidden items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider md:inline-flex ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                }`}
              >
                {isActive ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                {isActive ? 'Ativo' : 'Inativo'}
              </span>

              <div className="flex items-center gap-1.5 self-end md:self-auto md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onEdit(admin)
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-500 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300"
                  aria-label="Editar administrador"
                  title="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onDelete(admin)
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-rose-900/30 dark:hover:text-rose-300"
                  aria-label="Excluir administrador"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </article>
        )
      })}
      </div>
    </div>
  )
}
