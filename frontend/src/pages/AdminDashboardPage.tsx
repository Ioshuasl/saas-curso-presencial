import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Loader2,
  TrendingDown,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'

import { StatCard } from '../components/dashboard'
import { cursoService, financeiroService, inscricaoService } from '../services'
import type { Curso } from '../types'
import { cn } from '../utils'

function formatYmdLocal(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatBrl(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

type AgendaItem = {
  key: string
  horario: string
  cursoNome: string
  ministrante: string
  local?: string | null
}

function buildAgendaItems(cursos: Curso[], dataRef: string): AgendaItem[] {
  const items: AgendaItem[] = []
  for (const curso of cursos) {
    for (const s of curso.sessoes ?? []) {
      const dataSessao = s.data?.slice(0, 10)
      if (dataSessao && dataSessao !== dataRef) continue
      const horario = s.horario_inicio
        ? String(s.horario_inicio).slice(0, 5)
        : '--:--'
      items.push({
        key: `${curso.id}-${s.id}`,
        horario,
        cursoNome: curso.nome,
        ministrante: curso.ministrante,
        local: s.local ?? curso.local,
      })
    }
  }
  return items.sort((a, b) => a.horario.localeCompare(b.horario))
}

const quickLinks = [
  {
    to: '/cursos',
    label: 'Cursos',
    description: 'Cadastro e sessoes',
    icon: BookOpen,
  },
  {
    to: '/alunos',
    label: 'Alunos',
    description: 'Matriculas e perfis',
    icon: GraduationCap,
  },
  {
    to: '/financeiro',
    label: 'Financeiro',
    description: 'Receitas e despesas',
    icon: Wallet,
  },
  {
    to: '/admins',
    label: 'Administradores',
    description: 'Equipe do tenant',
    icon: UserCog,
  },
] as const

export function AdminDashboardPage() {
  const { search } = useLocation()
  const qs = search || ''

  const [isLoading, setIsLoading] = useState(true)
  const [receita, setReceita] = useState(0)
  const [despesa, setDespesa] = useState(0)
  const [inscricoes, setInscricoes] = useState(0)
  const [cursosHoje, setCursosHoje] = useState<Curso[]>([])

  const dataYmd = useMemo(() => formatYmdLocal(new Date()), [])

  const agendaItems = useMemo(
    () => buildAgendaItems(cursosHoje, dataYmd),
    [cursosHoje, dataYmd],
  )

  const lucro = receita - despesa

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      try {
        const [resReceber, resPagar, resInsc, resCursos] = await Promise.all([
          financeiroService.totalContasReceber(),
          financeiroService.totalContasPagar(),
          inscricaoService.contarInscricoes(),
          cursoService.listarCursosPorData({ data: dataYmd }),
        ])

        if (cancelled) return

        setReceita(Number(resReceber.data?.valor_total ?? 0))
        setDespesa(Number(resPagar.data?.valor_total ?? 0))
        setInscricoes(Number(resInsc.data?.total ?? 0))
        setCursosHoje(Array.isArray(resCursos.data) ? resCursos.data : [])
      } catch {
        if (!cancelled && import.meta.env.DEV) {
          toast.error('Nao foi possivel carregar o dashboard.')
        }
        if (!cancelled) {
          setReceita(0)
          setDespesa(0)
          setInscricoes(0)
          setCursosHoje([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [dataYmd])

  if (isLoading) {
    return (
      <section className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-indigo-600 dark:text-indigo-400">
        <Loader2 className="animate-spin" size={40} aria-hidden />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Carregando painel...
        </p>
      </section>
    )
  }

  return (
    <section className="scrollbar-hide flex h-full min-h-0 flex-1 flex-col gap-6 overflow-y-auto pb-4 lg:gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-3 xl:grid-cols-4">
        <StatCard
          label="Receita total"
          value={formatBrl(receita)}
          badge="Contas a receber"
          trend="up"
          icon={<TrendingUp className="text-emerald-600 dark:text-emerald-400" size={20} />}
          iconTint="bg-emerald-50 dark:bg-emerald-950/40"
        />
        <StatCard
          label="Despesa total"
          value={formatBrl(despesa)}
          badge="Contas a pagar"
          trend="down"
          icon={<TrendingDown className="text-rose-600 dark:text-rose-400" size={20} />}
          iconTint="bg-rose-50 dark:bg-rose-950/40"
        />
        <StatCard
          label="Lucro"
          value={formatBrl(lucro)}
          badge="Receita - despesa"
          trend={lucro >= 0 ? 'up' : 'down'}
          icon={<TrendingUp className="text-indigo-600 dark:text-indigo-400" size={20} />}
          iconTint="bg-indigo-50 dark:bg-indigo-950/40"
        />
        <StatCard
          label="Inscricoes"
          value={String(inscricoes)}
          badge="Total no tenant"
          trend="neutral"
          icon={<Users className="text-amber-600 dark:text-amber-400" size={20} />}
          iconTint="bg-amber-50 dark:bg-amber-950/40"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40">
                <CalendarDays className="text-indigo-600 dark:text-indigo-400" size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Agenda de hoje</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Sessoes dos cursos nesta data
                </p>
              </div>
            </div>

            {agendaItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center dark:border-slate-700 dark:bg-slate-950/40">
                <ClipboardList className="mx-auto mb-3 text-slate-300 dark:text-slate-600" size={36} />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Nenhuma sessao agendada para hoje.
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                  Quando houver sessoes na data atual, elas aparecem aqui.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {agendaItems.map((item) => (
                  <li
                    key={item.key}
                    className="flex flex-col gap-1 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="mt-0.5 shrink-0 rounded-lg bg-white px-2 py-1 text-xs font-black tabular-nums text-indigo-700 shadow-sm dark:bg-slate-900 dark:text-indigo-300">
                        {item.horario}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900 dark:text-slate-100">{item.cursoNome}</p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {item.ministrante}
                          {item.local ? ` · ${item.local}` : ''}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="px-1 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Acesso rapido
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
            {quickLinks.map((item) => {
              const Icon = item.icon
              return (
              <Link
                key={item.to}
                to={`${item.to}${qs}`}
                className={cn(
                  'group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition-all',
                  'hover:border-indigo-200 hover:bg-indigo-50/60 dark:border-slate-800 dark:bg-slate-900',
                  'dark:hover:border-indigo-900 dark:hover:bg-indigo-950/30',
                )}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Icon size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-slate-900 dark:text-slate-100">{item.label}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{item.description}</span>
                </span>
                <ArrowRight
                  size={18}
                  className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-500 dark:text-slate-600"
                />
              </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
