import { useMemo, useState } from 'react'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import { toast } from 'sonner'

import { authService } from '../services'
import type { LoginRequest, UserRole, UsuarioBase } from '../types'
import { resolveTenantSlugFromBrowser } from '../utils'

type LoginPageProps = {
  onLoginSuccess: (payload: { user: UsuarioBase; role: UserRole }) => void
}

function resolveUserRole(user: UsuarioBase): UserRole {
  const rawRole = String(user.role ?? user.tipo ?? '').toUpperCase()
  if (rawRole === 'ADMIN') return 'admin'
  if (rawRole === 'SAAS_ADMIN') return 'saas_admin'
  return 'student'
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const lastSession = authService.getSession()
  const detectedTenantSlug = useMemo(
    () =>
      resolveTenantSlugFromBrowser() ??
      lastSession?.tenantSlug ??
      import.meta.env.VITE_DEFAULT_TENANT_SLUG ??
      '',
    [lastSession?.tenantSlug],
  )

  const [form, setForm] = useState<Omit<LoginRequest, 'tenant_slug' | 'tenant_id'>>({
    identificador: '',
    senha: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    if (!detectedTenantSlug) {
      setError('Tenant não identificado na URL. Use ?tenant_slug=seu-tenant para entrar.')
      setIsSubmitting(false)
      return
    }

    try {
      const payload: LoginRequest = {
        ...form,
        tenant_slug: detectedTenantSlug,
      }
      const response = await authService.login(payload)
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
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 dark:bg-slate-950">
      <section className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.10)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Bem-vindo de volta
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Entre com suas credenciais para acessar o painel.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {import.meta.env.DEV ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
              Tenant detectado:{' '}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {detectedTenantSlug || 'não identificado'}
              </span>
            </p>
          ) : null}

          <div className="space-y-1.5">
            <label htmlFor="identificador" className="sr-only">
              Identificador
            </label>
            <div className="relative">
              <User
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/60"
                placeholder="E-mail ou Usuario"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="senha" className="sr-only">
              Senha
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="senha"
                type={showPassword ? 'text' : 'password'}
                value={form.senha}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    senha: event.target.value,
                  }))
                }
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/60"
                placeholder="Sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(79,70,229,0.35)] transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Entrando...' : 'Acessar painel'}
          </button>
        </form>

        <p className="mt-5 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
          Opus v1.0 - Painel Administrativo
        </p>
      </section>
    </main>
  )
}
