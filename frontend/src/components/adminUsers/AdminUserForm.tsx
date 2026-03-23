import { useEffect, useState } from 'react'

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

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-3xl space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900"
      >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {isEditing ? 'Atualizar administrador' : 'Cadastrar administrador'}
        </h3>

        {isEditing ? (
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Cancelar edicao
          </button>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <InputField
          label="Nome completo"
          value={form.nome_completo}
          onChange={(value) => setForm((prev) => ({ ...prev, nome_completo: value }))}
          required
        />

        <InputField
          label="Username"
          value={form.username}
          onChange={(value) => setForm((prev) => ({ ...prev, username: value }))}
          required
        />

        <InputField
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
          required
        />

        <InputField
          label="CPF"
          value={form.cpf}
          onChange={(value) => setForm((prev) => ({ ...prev, cpf: value }))}
        />

        <InputField
          label={isEditing ? 'Nova senha (opcional)' : 'Senha'}
          type="password"
          value={form.senha}
          onChange={(value) => setForm((prev) => ({ ...prev, senha: value }))}
          required={!isEditing}
        />

        <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={form.status}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, status: event.target.checked }))
            }
          />
          Usuario ativo
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting
          ? 'Salvando...'
          : isEditing
            ? 'Atualizar administrador'
            : 'Cadastrar administrador'}
      </button>
      </form>
    </div>
  )
}

type InputFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: InputFieldProps) {
  return (
    <label className="space-y-1">
      <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-800"
      />
    </label>
  )
}
