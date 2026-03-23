import { useState } from 'react'
import { toast } from 'sonner'

import { authService } from '../services'
import type { LoginRequest, UserRole, UsuarioBase } from '../types'

type LoginPageProps = {
  onLoginSuccess: (payload: { user: UsuarioBase; role: UserRole }) => void
}

function resolveUserRole(user: UsuarioBase): UserRole {
  const rawRole = String(user.role ?? user.tipo ?? '').toUpperCase()
  return rawRole === 'ADMIN' ? 'admin' : 'student'
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [form, setForm] = useState<LoginRequest>({ identificador: '', senha: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await authService.login(form)
      const user = response.data.usuario
      const role = resolveUserRole(user)

      if (import.meta.env.DEV) {
        toast.success('Login realizado com sucesso.')
      }

      onLoginSuccess({ user, role })
    } catch {
      setError('Nao foi possivel entrar. Verifique suas credenciais.')
      if (import.meta.env.DEV) {
        toast.error('Falha no login. Confira as credenciais e o backend.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Entrar na plataforma
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Informe seu usuario, email ou CPF e sua senha.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="identificador"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Identificador
            </label>
            <input
              id="identificador"
              type="text"
              value={form.identificador}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  identificador: event.target.value,
                }))
              }
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-800"
              placeholder="username, email ou CPF"
            />
          </div>

          <div>
            <label
              htmlFor="senha"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={form.senha}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  senha: event.target.value,
                }))
              }
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-800"
              placeholder="Digite sua senha"
            />
          </div>

          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}
