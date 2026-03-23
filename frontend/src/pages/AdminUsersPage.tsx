import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { AdminUserForm, AdminUsersList } from '../components'
import { usuarioService } from '../services'
import type {
  AdminListItem,
  CreateAdminRequest,
  PaginacaoApi,
  UpdateAdminRequest,
} from '../types'

export function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminListItem[]>([])
  const [pagination, setPagination] = useState<PaginacaoApi | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<AdminListItem | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  async function loadAdmins() {
    setIsLoading(true)
    try {
      const response = await usuarioService.listarAdmins({ page: 1, limit: 10 })
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
    void loadAdmins()
  }, [])

  async function handleSubmit(payload: CreateAdminRequest | UpdateAdminRequest) {
    setIsSubmitting(true)
    try {
      if (selectedAdmin) {
        await usuarioService.atualizarAdmin(selectedAdmin.id, payload as UpdateAdminRequest)
        if (import.meta.env.DEV) {
          toast.success('Administrador atualizado com sucesso.')
        }
      } else {
        await usuarioService.criarAdmin(payload as CreateAdminRequest)
        if (import.meta.env.DEV) {
          toast.success('Administrador cadastrado com sucesso.')
        }
      }

      setSelectedAdmin(null)
      setIsFormOpen(false)
      await loadAdmins()
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
      await loadAdmins()
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Nao foi possivel excluir o administrador.')
      }
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Administradores</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Listagem e cadastro/atualizacao de usuarios administradores.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedAdmin(null)
            setIsFormOpen(true)
          }}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          Novo administrador
        </button>
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
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Total: {pagination.total} administrador(es) - Pagina {pagination.pagina} de{' '}
          {pagination.total_paginas}
        </p>
      ) : null}
    </section>
  )
}
