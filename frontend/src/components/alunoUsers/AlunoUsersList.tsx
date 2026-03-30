import { useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Pencil,
  Trash2,
  TrendingUp,
  User as UserIcon,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'

import type { Aluno } from '../../types'
import { cn } from '../../utils'
import { usuarioService } from '../../services'
import type { AlunoDetalheResponse } from '../../types'
import { AlunoInsightsModal } from './AlunoInsightsModal'

type AlunoUsersListProps = {
  alunos: Aluno[]
  isLoading: boolean
  onEdit: (aluno: Aluno) => void
  onDelete: (aluno: Aluno) => void
  className?: string
}

export function AlunoUsersList({ alunos, isLoading, onEdit, onDelete, className }: AlunoUsersListProps) {
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null)
  const [alunoDetalhe, setAlunoDetalhe] = useState<AlunoDetalheResponse | null>(null)
  const [isInsightsOpen, setIsInsightsOpen] = useState(false)
  const [isInsightsLoading, setIsInsightsLoading] = useState(false)

  async function handleOpenInsights(aluno: Aluno) {
    setSelectedAluno(aluno)
    setIsInsightsOpen(true)
    setIsInsightsLoading(true)
    try {
      const response = await usuarioService.buscarAlunoPorId(aluno.id)
      setAlunoDetalhe(response.data)
    } catch {
      setAlunoDetalhe(null)
      if (import.meta.env.DEV) {
        toast.error('Nao foi possivel carregar as inscricoes do aluno.')
      }
    } finally {
      setIsInsightsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-7 text-center text-sm font-semibold text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        Carregando alunos...
      </div>
    )
  }

  if (!alunos.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
        <UserIcon size={44} className="mb-3 text-slate-300 dark:text-slate-600" />
        <p className="text-base font-black text-slate-500 dark:text-slate-300">Nenhum aluno encontrado</p>
        <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">
          Tente ajustar os filtros para buscar novamente.
        </p>
      </div>
    )
  }

  return (
    <>
      <AlunoInsightsModal
        aluno={selectedAluno}
        alunoDetalhe={alunoDetalhe}
        isOpen={isInsightsOpen}
        isLoading={isInsightsLoading}
        onClose={() => {
          setIsInsightsOpen(false)
          setSelectedAluno(null)
          setAlunoDetalhe(null)
        }}
      />

      <div className={cn('min-w-0 pr-1', className)}>
        <div className="grid grid-cols-1 gap-3 md:gap-2">
        {alunos.map((aluno) => {
        const isActive = Boolean(aluno.status)
        const alunoNome = aluno.perfil_aluno?.nome_completo || aluno.nome_completo || aluno.username
        const totalCursos = Number(aluno.total_cursos_inscritos ?? 0)
        const cpf = aluno.cpf || '---'

        return (
          <article
            key={aluno.id}
            role="button"
            tabIndex={0}
            onClick={() => onEdit(aluno)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onEdit(aluno)
              }
            }}
            className="group rounded-2xl border border-slate-200 bg-white transition-all hover:border-indigo-100 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900/60"
          >
            <div className="flex flex-col justify-between gap-4 p-4 md:flex-row md:items-center md:gap-3 md:py-2.5 md:pl-3 md:pr-3">
              <div className="flex min-w-0 items-start gap-3.5 md:items-center md:gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-base font-black text-indigo-600 transition-all group-hover:bg-indigo-600 group-hover:text-white dark:bg-slate-800 dark:text-indigo-300 md:h-9 md:w-9 md:rounded-lg md:text-sm">
                  {alunoNome.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 md:gap-1.5">
                    <h4 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100 md:text-sm md:leading-tight">
                      {alunoNome}
                    </h4>
                    <span
                      className="inline-flex items-center rounded-md bg-indigo-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 md:py-px md:text-[8px]"
                    >
                      {totalCursos} {totalCursos === 1 ? 'Curso' : 'Cursos'}
                    </span>
                  </div>

                  <p className="mt-0.5 text-[9px] font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500 md:mt-0 md:leading-none">
                    @{aluno.username}
                  </p>

                  <div className="mt-1.5 flex flex-wrap gap-3 md:mt-0.5 md:gap-x-3 md:gap-y-0">
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 md:text-[9px]">
                      CPF: {cpf}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 md:text-[9px]">
                      Email: {aluno.email}
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
                className={`hidden shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider md:inline-flex md:py-px ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                }`}
              >
                {isActive ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                {isActive ? 'Ativo' : 'Inativo'}
              </span>

              <div className="flex items-center gap-2 self-end md:gap-1.5 md:self-auto">
                <div className="mr-1 flex items-center gap-1.5 md:mr-0 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onEdit(aluno)
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-500 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300 md:h-8 md:w-8"
                    aria-label="Editar aluno"
                    title="Editar perfil"
                  >
                    <Pencil className="h-4 w-4 shrink-0 md:h-3.5 md:w-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onDelete(aluno)
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-rose-900/30 dark:hover:text-rose-300 md:h-8 md:w-8"
                    aria-label="Excluir aluno"
                    title="Excluir aluno"
                  >
                    <Trash2 className="h-4 w-4 shrink-0 md:h-3.5 md:w-3.5" aria-hidden />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    void handleOpenInsights(aluno)
                  }}
                  className="group/btn inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-bold text-slate-700 transition-all hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-indigo-600 md:gap-1 md:rounded-lg md:px-2.5 md:py-1.5 md:text-[10px] md:font-semibold"
                >
                  <TrendingUp
                    className="h-3.5 w-3.5 shrink-0 text-indigo-500 transition-colors group-hover/btn:text-white md:h-3 md:w-3"
                    aria-hidden
                  />
                  Ver inscricoes
                  <ArrowRight
                    className="h-3 w-3 shrink-0 opacity-0 transition-all group-hover/btn:translate-x-0.5 group-hover/btn:opacity-100"
                    aria-hidden
                  />
                </button>
              </div>
            </div>
          </article>
        )
        })}
        </div>
      </div>
    </>
  )
}
