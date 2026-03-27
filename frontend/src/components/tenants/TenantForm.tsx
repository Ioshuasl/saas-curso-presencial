import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Switch } from '../ui/Switch'
import type { CreateTenantRequest, Tenant, UpdateTenantRequest } from '../../types'

type TenantFormProps = {
  isOpen: boolean
  selectedTenant: Tenant | null
  isSubmitting: boolean
  onSubmit: (payload: CreateTenantRequest | UpdateTenantRequest) => Promise<void>
  onClose: () => void
}

type FormState = {
  nome: string
  slug: string
  ativo: boolean
}

const initialState: FormState = {
  nome: '',
  slug: '',
  ativo: true,
}

export function TenantForm({
  isOpen,
  selectedTenant,
  isSubmitting,
  onSubmit,
  onClose,
}: TenantFormProps) {
  const [form, setForm] = useState<FormState>(initialState)

  useEffect(() => {
    if (!selectedTenant) {
      setForm(initialState)
      return
    }

    setForm({
      nome: selectedTenant.nome ?? '',
      slug: selectedTenant.slug ?? '',
      ativo: Boolean(selectedTenant.ativo),
    })
  }, [selectedTenant])

  const isEditing = Boolean(selectedTenant)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const payload = {
      nome: form.nome.trim(),
      slug: form.slug.trim() || undefined,
      ativo: form.ativo,
    }

    await onSubmit(payload)
  }

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="flex h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:h-auto sm:max-h-[88dvh] sm:max-w-3xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 dark:border-slate-800 sm:px-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg">
              {isEditing ? 'Atualizar tenant' : 'Cadastrar tenant'}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Preencha os dados para manter os clientes SaaS organizados.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Fechar modal"
            title="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Nome do tenant"
              value={form.nome}
              onChange={(event) => setForm((prev) => ({ ...prev, nome: event.target.value }))}
              required
            />

            <Input
              label="Slug"
              value={form.slug}
              onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              helperText="Opcional. Use letras, numeros e hifens."
            />

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-800/40 md:col-span-2">
              <Switch
                label={form.ativo ? 'Tenant ativo' : 'Tenant inativo'}
                description={
                  form.ativo
                    ? 'Tenant liberado para operacao no sistema.'
                    : 'Tenant bloqueado para novos acessos.'
                }
                checked={form.ativo}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, ativo: checked }))}
                activeColor="bg-emerald-600"
                inactiveColor="bg-rose-500"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-4 py-4 dark:border-slate-800 sm:flex-row sm:justify-end sm:px-6">
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
            {isEditing ? 'Atualizar tenant' : 'Cadastrar tenant'}
          </Button>
        </div>
      </form>
    </div>
  )
}

