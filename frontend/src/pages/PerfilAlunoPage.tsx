import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/TextArea'
import { usuarioService } from '../services'
import type { UpdateAlunoRequest, UsuarioBase } from '../types'

type PerfilForm = {
  nome_completo: string
  username: string
  email: string
  telefone: string
  cidade: string
  profissao: string
  biografia: string
}

export function PerfilAlunoPage() {
  const [user, setUser] = useState<UsuarioBase | null>(null)
  const [form, setForm] = useState<PerfilForm>({
    nome_completo: '',
    username: '',
    email: '',
    telefone: '',
    cidade: '',
    profissao: '',
    biografia: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function loadProfile() {
    setIsLoading(true)
    try {
      const response = await usuarioService.me()
      const profile = response.data
      setUser(profile)
      setForm({
        nome_completo: profile.nome_completo ?? '',
        username: profile.username ?? '',
        email: profile.email ?? '',
        telefone: profile.telefone ?? '',
        cidade: profile.cidade ?? '',
        profissao: profile.profissao ?? '',
        biografia: profile.biografia ?? '',
      })
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Nao foi possivel carregar o seu perfil.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    const payload: UpdateAlunoRequest = {
      nome_completo: form.nome_completo.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      telefone: form.telefone.trim() || undefined,
      cidade: form.cidade.trim() || undefined,
      profissao: form.profissao.trim() || undefined,
      biografia: form.biografia.trim() || undefined,
    }

    setIsSubmitting(true)
    try {
      await usuarioService.atualizarAluno(user.id, payload)
      if (import.meta.env.DEV) {
        toast.success('Perfil atualizado com sucesso.')
      }
      await loadProfile()
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Nao foi possivel atualizar o perfil.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    void loadProfile()
  }, [])

  return (
    <section className="scrollbar-hide flex h-full min-h-0 flex-1 flex-col gap-6 overflow-y-auto md:gap-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
          Meu Perfil
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Atualize seus dados pessoais para personalizar sua experiencia.
        </p>
      </div>

      <form
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
        onSubmit={(event) => {
          void handleSubmit(event)
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Nome completo"
            value={form.nome_completo}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, nome_completo: event.target.value }))
            }}
            disabled={isLoading || isSubmitting}
          />
          <Input
            label="Username"
            value={form.username}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, username: event.target.value }))
            }}
            disabled={isLoading || isSubmitting}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, email: event.target.value }))
            }}
            disabled={isLoading || isSubmitting}
          />
          <Input
            label="Telefone"
            value={form.telefone}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, telefone: event.target.value }))
            }}
            disabled={isLoading || isSubmitting}
          />
          <Input
            label="Cidade"
            value={form.cidade}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, cidade: event.target.value }))
            }}
            disabled={isLoading || isSubmitting}
          />
          <Input
            label="Profissao"
            value={form.profissao}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, profissao: event.target.value }))
            }}
            disabled={isLoading || isSubmitting}
          />
        </div>

        <Textarea
          label="Biografia"
          value={form.biografia}
          onChange={(event) => {
            setForm((prev) => ({ ...prev, biografia: event.target.value }))
          }}
          disabled={isLoading || isSubmitting}
          rows={4}
        />

        <Button type="submit" isLoading={isSubmitting} disabled={isLoading}>
          Salvar alteracoes
        </Button>
      </form>
    </section>
  )
}
