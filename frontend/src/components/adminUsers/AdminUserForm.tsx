import { Lock, Mail, Save, Shield, User as UserIcon, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { MaskedInput } from '../ui/MaskedInput'
import { Switch } from '../ui/Switch'
import type { AdminListItem, CreateAdminRequest, UpdateAdminRequest } from '../../types'

type AdminUserFormProps = {
  isOpen: boolean
  selectedAdmin: AdminListItem | null
  isSubmitting: boolean
  onSubmit: (payload: CreateAdminRequest | UpdateAdminRequest) => Promise<void>
  onClose: () => void
}

type FormState = {
  username: string
  email: string
  cpf: string
  nome_completo: string
  senha: string
  status: boolean
}

const initialState: FormState = {
  username: '',
  email: '',
  cpf: '',
  nome_completo: '',
  senha: '',
  status: true,
}

export function AdminUserForm({
  isOpen,
  selectedAdmin,
  isSubmitting,
  onSubmit,
  onClose,
}: AdminUserFormProps) {
  const [form, setForm] = useState<FormState>(initialState)
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!selectedAdmin) {
      setForm(initialState)
      return
    }

    setForm({
      username: selectedAdmin.username ?? '',
      email: selectedAdmin.email ?? '',
      cpf: selectedAdmin.cpf ?? '',
      nome_completo: selectedAdmin.perfil_admin?.nome_completo ?? '',
      senha: '',
      status: Boolean(selectedAdmin.status),
    })
  }, [selectedAdmin])

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      const timeout = window.setTimeout(() => {
        setIsVisible(true)
      }, 40)
      return () => window.clearTimeout(timeout)
    }

    setIsVisible(false)
    const timeout = window.setTimeout(() => {
      setShouldRender(false)
    }, 780)

    return () => window.clearTimeout(timeout)
  }, [isOpen])

  const isEditing = Boolean(selectedAdmin)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isEditing) {
      const payload: UpdateAdminRequest = {
        username: form.username,
        email: form.email,
        cpf: form.cpf || undefined,
        nome_completo: form.nome_completo,
        status: form.status,
      }

      if (form.senha) {
        payload.senha = form.senha
      }

      await onSubmit(payload)
      return
    }

    await onSubmit({
      username: form.username,
      email: form.email,
      cpf: form.cpf || undefined,
      senha: form.senha,
      nome_completo: form.nome_completo,
      status: form.status,
    })
  }

  if (!shouldRender) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex h-[100dvh] w-screen items-end justify-center overflow-hidden p-0 backdrop-blur-sm transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:items-center sm:p-4 ${
        isVisible ? 'bg-slate-900/55 opacity-100' : 'bg-slate-900/0 opacity-0'
      }`}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className={`flex h-[92dvh] w-full min-h-0 flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform dark:border-slate-800 dark:bg-slate-900 sm:h-[min(88dvh,920px)] sm:max-w-4xl sm:rounded-3xl ${
          isVisible
            ? 'translate-y-0 opacity-100 sm:scale-100'
            : 'translate-y-16 opacity-0 sm:translate-y-4 sm:scale-[0.97]'
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-6 dark:border-slate-800 sm:px-8">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {isEditing ? 'Editar Cadastro' : 'Novo Administrador'}
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              Informações de acesso e permissão do administrador
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Fechar modal"
            title="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
            <div className="space-y-6">
              <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
                <span className="h-px w-5 bg-indigo-600 dark:bg-indigo-300" />
                Dados obrigatórios
              </h4>

              <Input
                label="Nome completo"
                value={form.nome_completo}
                onChange={(event) => setForm((prev) => ({ ...prev, nome_completo: event.target.value }))}
                startIcon={<UserIcon size={16} />}
                placeholder="Ex: Maria Silva"
                required
              />

              <Input
                label="Username"
                value={form.username}
                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                startIcon={<UserIcon size={16} />}
                placeholder="Ex: maria.silva"
                required
              />

              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                startIcon={<Mail size={16} />}
                placeholder="admin@empresa.com"
                required
              />
            </div>

            <div className="space-y-6">
              <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
                <span className="h-px w-5 bg-indigo-600 dark:bg-indigo-300" />
                Segurança e status
              </h4>

              <MaskedInput
                label="CPF"
                maskType="cpf"
                value={form.cpf}
                onAccept={(value) => setForm((prev) => ({ ...prev, cpf: value }))}
              />

              <Input
                label={isEditing ? 'Nova senha (opcional)' : 'Senha de acesso'}
                type="password"
                value={form.senha}
                onChange={(event) => setForm((prev) => ({ ...prev, senha: event.target.value }))}
                startIcon={<Lock size={16} />}
                placeholder={isEditing ? '••••••••' : 'Minimo 6 caracteres'}
                required={!isEditing}
                helperText={isEditing ? 'Deixe em branco para manter a senha atual.' : undefined}
              />

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-800/40">
                <Switch
                  label={form.status ? 'Administrador ativo' : 'Administrador inativo'}
                  description={
                    form.status
                      ? 'Usuário liberado para acessar o sistema.'
                      : 'Usuário bloqueado para acesso ao sistema.'
                  }
                  checked={form.status}
                  onCheckedChange={(checked) => setForm((prev) => ({ ...prev, status: checked }))}
                  activeColor="bg-emerald-600"
                  inactiveColor="bg-rose-500"
                />
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                <Shield size={14} />
                Perfil com acesso administrativo ao CRM
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-6 py-5 dark:border-slate-800 sm:flex-row sm:justify-end sm:px-8">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full rounded-2xl border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            startIcon={<Save size={18} />}
            className="w-full rounded-2xl px-7 py-3 text-sm font-bold uppercase tracking-wider shadow-xl shadow-indigo-200/40 sm:w-auto dark:shadow-indigo-950/40"
          >
            {isEditing ? 'Salvar alterações' : 'Salvar administrador'}
          </Button>
        </div>
      </form>
    </div>
  )
}
