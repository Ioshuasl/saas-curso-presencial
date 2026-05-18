import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Briefcase,
  GraduationCap,
  Lock,
  LogIn,
  Mail,
  MapPin,
  Save,
  User as UserIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { MaskedInput } from '../components/ui/MaskedInput'
import { Textarea } from '../components/ui/TextArea'
import { authService, cursoService } from '../services'
import type { Curso, UserRole, UsuarioBase } from '../types'
import { resolveTenantSlugFromBrowser } from '../utils'

type CadastroAlunoPageProps = {
  onCadastroSuccess: (payload: { user: UsuarioBase; role: UserRole }) => void
}

type FormState = {
  nome_completo: string
  username: string
  email: string
  telefone: string
  cidade: string
  profissao: string
  biografia: string
  senha: string
  confirmar_senha: string
}

const initialForm: FormState = {
  nome_completo: '',
  username: '',
  email: '',
  telefone: '',
  cidade: '',
  profissao: '',
  biografia: '',
  senha: '',
  confirmar_senha: '',
}

function extractApiError(error: unknown): string | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error ===
      'string'
  ) {
    return (error as { response?: { data?: { error?: string } } }).response?.data?.error ?? null
  }
  return null
}

function parseCursoId(raw: string | null): number | undefined {
  if (!raw?.trim()) return undefined
  const id = Number.parseInt(raw, 10)
  if (!Number.isInteger(id) || id < 1) return undefined
  return id
}

export function CadastroAlunoPage({ onCadastroSuccess }: CadastroAlunoPageProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tenantSlug = resolveTenantSlugFromBrowser()
  const cursoId = parseCursoId(searchParams.get('curso_id'))

  const [form, setForm] = useState<FormState>(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cursoPreview, setCursoPreview] = useState<Curso | null>(null)
  const [isLoadingCurso, setIsLoadingCurso] = useState(false)
  const [cursoLoadError, setCursoLoadError] = useState<string | null>(null)

  const loginHref = useMemo(() => {
    if (!tenantSlug) return '/login'
    return `/login?tenant_slug=${encodeURIComponent(tenantSlug)}`
  }, [tenantSlug])

  useEffect(() => {
    if (!tenantSlug || !cursoId) {
      setCursoPreview(null)
      setCursoLoadError(null)
      return
    }

    let cancelled = false
    setIsLoadingCurso(true)
    setCursoLoadError(null)

    void cursoService
      .buscarCursoPorId(cursoId, { tenant_slug: tenantSlug })
      .then((response) => {
        if (cancelled) return
        setCursoPreview(response.data)
      })
      .catch(() => {
        if (cancelled) return
        setCursoPreview(null)
        setCursoLoadError('Não foi possível carregar os dados do curso. Verifique se o link está correto.')
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCurso(false)
      })

    return () => {
      cancelled = true
    }
  }, [tenantSlug, cursoId])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!tenantSlug) {
      setError('Link inválido: tenant não identificado. Solicite um novo link ao administrador.')
      return
    }

    if (form.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      return
    }

    if (form.senha !== form.confirmar_senha) {
      setError('As senhas informadas não coincidem.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await authService.cadastrarAluno({
        tenant_slug: tenantSlug,
        username: form.username.trim(),
        email: form.email.trim(),
        senha: form.senha,
        nome_completo: form.nome_completo.trim(),
        telefone: form.telefone.trim(),
        cidade: form.cidade.trim() || undefined,
        profissao: form.profissao.trim() || undefined,
        biografia: form.biografia.trim() || undefined,
        ...(cursoId ? { curso_id: cursoId } : {}),
      })

      toast.success(
        cursoId ? 'Cadastro realizado e inscrição no curso confirmada.' : 'Cadastro realizado com sucesso.',
      )
      onCadastroSuccess({ user: response.data.usuario, role: 'student' })
    } catch (submitError) {
      const message = extractApiError(submitError) ?? 'Não foi possível concluir o cadastro. Tente novamente.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!tenantSlug) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-slate-100 px-4 py-10 dark:bg-slate-950">
        <section className="w-full max-w-lg rounded-3xl border border-rose-200/80 bg-white p-8 text-center shadow-lg dark:border-rose-900/50 dark:bg-slate-900">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Link inválido</h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            Este endereço não contém o identificador da instituição (<code>tenant_slug</code>).
            Peça ao administrador um novo link de cadastro.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Ir para o login
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-[100dvh] bg-slate-100 dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
        <header className="mb-6 text-center sm:mb-8 md:text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-300">
            Cadastro de aluno
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl lg:text-4xl">
            Crie sua conta
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-medium text-slate-600 dark:text-slate-400 sm:text-base">
            Preencha seus dados para acessar a plataforma
            {cursoId ? ' e confirmar sua inscrição no curso indicado.' : '.'}
          </p>
          <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-start">
            <Link
              to={loginHref}
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              <LogIn size={16} />
              Já tenho conta — entrar
            </Link>
          </div>
        </header>

        {cursoId ? (
          <section
            className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/40 sm:p-5"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <GraduationCap size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
                  Inscrição no curso
                </p>
                {isLoadingCurso ? (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Carregando curso...</p>
                ) : cursoPreview ? (
                  <>
                    <p className="mt-1 truncate text-base font-bold text-slate-900 dark:text-slate-100">
                      {cursoPreview.nome}
                    </p>
                    {cursoPreview.ministrante ? (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Ministrante: {cursoPreview.ministrante}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                    {cursoLoadError ?? 'Curso selecionado no link.'}
                  </p>
                )}
              </div>
            </div>
          </section>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-12">
              <div className="space-y-5 sm:space-y-6">
                <h2 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
                  <span className="h-px w-5 bg-indigo-600 dark:bg-indigo-300" />
                  Dados obrigatórios
                </h2>

                <Input
                  label="Nome completo"
                  value={form.nome_completo}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, nome_completo: event.target.value }))
                  }
                  startIcon={<UserIcon size={16} />}
                  placeholder="Ex: João da Silva"
                  required
                  fullWidth
                />

                <Input
                  label="Username"
                  value={form.username}
                  onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                  startIcon={<UserIcon size={16} />}
                  placeholder="Ex: joao.silva"
                  required
                  fullWidth
                />

                <Input
                  label="E-mail"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  startIcon={<Mail size={16} />}
                  placeholder="joao@email.com"
                  required
                  fullWidth
                />

                <MaskedInput
                  label="Telefone / WhatsApp"
                  maskType="phone"
                  value={form.telefone}
                  onAccept={(value) => setForm((prev) => ({ ...prev, telefone: value }))}
                  required
                />

                <Input
                  label="Senha de acesso"
                  type="password"
                  value={form.senha}
                  onChange={(event) => setForm((prev) => ({ ...prev, senha: event.target.value }))}
                  startIcon={<Lock size={16} />}
                  placeholder="Mínimo 6 caracteres"
                  required
                  fullWidth
                  helperText="Use no mínimo 6 caracteres."
                />

                <Input
                  label="Confirmar senha"
                  type="password"
                  value={form.confirmar_senha}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, confirmar_senha: event.target.value }))
                  }
                  startIcon={<Lock size={16} />}
                  placeholder="Repita a senha"
                  required
                  fullWidth
                />
              </div>

              <div className="space-y-5 sm:space-y-6">
                <h2 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
                  <span className="h-px w-5 bg-indigo-600 dark:bg-indigo-300" />
                  Informações complementares
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <Input
                    label="Cidade"
                    value={form.cidade}
                    onChange={(event) => setForm((prev) => ({ ...prev, cidade: event.target.value }))}
                    startIcon={<MapPin size={16} />}
                    placeholder="Ex: Goiânia"
                    fullWidth
                  />

                  <Input
                    label="Profissão"
                    value={form.profissao}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, profissao: event.target.value }))
                    }
                    startIcon={<Briefcase size={16} />}
                    placeholder="Ex: Barbeiro"
                    fullWidth
                  />
                </div>

                <Textarea
                  label='Bio / "Fale sobre você"'
                  value={form.biografia}
                  onChange={(event) => setForm((prev) => ({ ...prev, biografia: event.target.value }))}
                  placeholder="Breve relato sobre suas motivações..."
                  rows={5}
                  fullWidth
                  className="[&_textarea]:rounded-2xl [&_textarea]:border-slate-200 [&_textarea]:bg-slate-50 [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:font-medium dark:[&_textarea]:border-slate-700 dark:[&_textarea]:bg-slate-800/70"
                />
              </div>
            </div>

            {error ? (
              <p
                className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200"
                role="alert"
              >
                {error}
              </p>
            ) : null}
          </div>

          <div className="sticky bottom-0 z-10 border-t border-slate-100 bg-white/95 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:static sm:px-8 sm:py-5 lg:px-10">
            <div className="flex flex-row gap-2 sm:justify-end sm:gap-3">
              <Button
                type="button"
                variant="outline"
                className="min-w-0 flex-1 rounded-2xl sm:w-auto sm:flex-none"
                onClick={() => navigate(loginHref)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                startIcon={<Save size={18} />}
                className="min-w-0 flex-1 rounded-2xl px-4 py-3 text-sm font-medium uppercase tracking-wider shadow-xl shadow-indigo-200/40 sm:w-auto sm:flex-none sm:px-8 sm:font-bold dark:shadow-indigo-950/40"
              >
                {cursoId ? 'Cadastrar e inscrever-se' : 'Criar minha conta'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
