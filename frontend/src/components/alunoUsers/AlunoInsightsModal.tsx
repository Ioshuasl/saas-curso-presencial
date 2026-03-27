import { useMemo, useState } from 'react'
import {
  Award,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  MessageSquare,
  Star,
  Target,
  X,
} from 'lucide-react'

import type { Aluno, AlunoDetalheResponse, AlunoDetalheInscricao } from '../../types'

type AlunoInsightsModalProps = {
  aluno: Aluno | null
  alunoDetalhe: AlunoDetalheResponse | null
  isOpen: boolean
  isLoading: boolean
  onClose: () => void
}

function formatDate(date?: string) {
  if (!date) return '-'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('pt-BR')
}

export function AlunoInsightsModal({
  aluno,
  alunoDetalhe,
  isOpen,
  isLoading,
  onClose,
}: AlunoInsightsModalProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const inscricoes = useMemo(() => alunoDetalhe?.inscricoes ?? [], [alunoDetalhe?.inscricoes])
  const alunoNome =
    alunoDetalhe?.perfil_aluno?.nome_completo ??
    aluno?.perfil_aluno?.nome_completo ??
    aluno?.nome_completo ??
    aluno?.username ??
    'Aluno'

  if (!isOpen || !aluno) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[90] flex h-[100dvh] w-screen items-center justify-center overflow-hidden p-4">
      <button
        type="button"
        aria-label="Fechar modal"
        className="absolute inset-0 h-full w-full bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex h-[min(90dvh,860px)] w-full max-w-5xl min-h-0 flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800 md:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-lg font-black text-white">
              {alunoNome.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-xl font-black text-slate-900 dark:text-slate-100">
                  {alunoNome}
                </h3>
                <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  <Layers size={12} />
                  {inscricoes.length} {inscricoes.length === 1 ? 'Curso' : 'Cursos'}
                </span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                Historico de inscricoes, sessoes, questionario e feedback final.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto scrollbar-hide bg-slate-50/40 p-4 dark:bg-slate-950/40 md:p-6">
          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              Carregando inscricoes...
            </div>
          ) : inscricoes.length ? (
            inscricoes.map((inscricao) => {
              const isExpanded = expandedId === inscricao.id
              const cursoNome = inscricao.curso?.nome ?? 'Curso nao identificado'
              const sessoes = inscricao.curso?.sessoes ?? []
              const avaliacao = inscricao.feedback_final?.avaliacao

              return (
                <article
                  key={inscricao.id}
                  className={`overflow-hidden rounded-2xl border bg-white transition-all dark:bg-slate-900 ${
                    isExpanded
                      ? 'border-indigo-200 shadow-lg dark:border-indigo-900/70'
                      : 'border-slate-200 shadow-sm dark:border-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : inscricao.id)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left md:px-6"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                          <Award size={14} />
                        </span>
                        <h4 className="truncate text-sm font-black uppercase tracking-wide text-slate-900 dark:text-slate-100">
                          {cursoNome}
                        </h4>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                          {sessoes.length} {sessoes.length === 1 ? 'Sessao' : 'Sessoes'}
                        </span>
                        {typeof avaliacao === 'number' ? (
                          <span className="inline-flex items-center gap-1 text-amber-500">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star
                                key={`${inscricao.id}-${idx}`}
                                size={11}
                                className={idx < avaliacao ? 'fill-amber-500' : 'text-slate-300'}
                              />
                            ))}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <span className="text-slate-400 dark:text-slate-500">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div
                        className={`transition-all duration-500 ${
                          isExpanded ? 'translate-y-0' : '-translate-y-1'
                        }`}
                      >
                        <ExpandedInscricao inscricao={inscricao} />
                      </div>
                    </div>
                  </div>
                </article>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
              <BookOpen size={40} className="mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-base font-black text-slate-500 dark:text-slate-300">
                Historico vazio
              </p>
              <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                Nenhuma inscricao registrada para este aluno.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ExpandedInscricao({ inscricao }: { inscricao: AlunoDetalheInscricao }) {
  const sessoes = inscricao.curso?.sessoes ?? []

  return (
    <div className="space-y-5 border-t border-slate-100 px-4 pb-5 pt-4 dark:border-slate-800 md:px-6">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sessoes.map((sessao, index) => (
          <div
            key={sessao.id}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[10px] font-black text-indigo-600 dark:bg-slate-900 dark:text-indigo-300">
              {index + 1}o
            </span>
            <div>
              <p className="text-[10px] font-black text-slate-800 dark:text-slate-100">
                {formatDate(sessao.data)}
              </p>
              <p className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                <Clock size={8} />
                {sessao.horario_inicio} - {sessao.horario_fim}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
            <Target size={12} />
            Questionario inicial
          </p>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-[10px] font-black uppercase tracking-wider text-rose-500">Maior dor</p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
              {inscricao.questionario_inicial?.maior_dor_inicio ?? 'Nao informado.'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500">
              Principal expectativa
            </p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
              {inscricao.questionario_inicial?.principal_expectativa ?? 'Nao informado.'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-300">
            <MessageSquare size={12} />
            Feedback final
          </p>
          {inscricao.feedback_final ? (
            <>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-900/20">
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Objetivo atingido
                </p>
                <p className="mt-1 text-sm text-emerald-900 dark:text-emerald-100">
                  {inscricao.feedback_final.objetivo_atingido}
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Resultado esperado
                </p>
                <p className="mt-1 text-sm text-amber-900 dark:text-amber-100">
                  {inscricao.feedback_final.resultado_esperado ?? 'Nao informado.'}
                </p>
                <p className="mt-3 text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Avaliacao: {inscricao.feedback_final.avaliacao}/5
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Feedback pendente
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
