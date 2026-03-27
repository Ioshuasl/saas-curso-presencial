import { useMemo, useState } from 'react'
import { CheckCircle2, Eye, Pencil, Trash2, UserRound, X, XCircle } from 'lucide-react'

import type { Curso } from '../../types'
import { inscricaoService } from '../../services/inscricaoService'
import type { CursoComInscritos } from '../../types/inscricao'
import { cn } from '../../utils'

type CursoListProps = {
  cursos: Curso[]
  isLoading: boolean
  onEdit: (curso: Curso) => void
  onDelete: (curso: Curso) => void
  className?: string
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function CursoList({ cursos, isLoading, onEdit, onDelete, className }: CursoListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoadingInscricoes, setIsLoadingInscricoes] = useState(false)
  const [inscricoesError, setInscricoesError] = useState<string | null>(null)
  const [cursoSelecionado, setCursoSelecionado] = useState<Curso | null>(null)
  const [cursoComInscritos, setCursoComInscritos] = useState<CursoComInscritos | null>(null)

  const alunosInscritos = useMemo(
    () => cursoComInscritos?.alunos_inscritos ?? [],
    [cursoComInscritos?.alunos_inscritos],
  )

  async function handleVisualizarInscricoes(curso: Curso) {
    setCursoSelecionado(curso)
    setCursoComInscritos(null)
    setInscricoesError(null)
    setIsLoadingInscricoes(true)
    setIsModalOpen(true)

    try {
      const response = await inscricaoService.listarInscricoesPorCurso(curso.id)
      setCursoComInscritos(response.data as CursoComInscritos)
    } catch {
      setInscricoesError('Nao foi possivel carregar as inscricoes deste curso.')
    } finally {
      setIsLoadingInscricoes(false)
    }
  }

  function handleCloseModal() {
    setIsModalOpen(false)
    setIsLoadingInscricoes(false)
    setInscricoesError(null)
    setCursoSelecionado(null)
    setCursoComInscritos(null)
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-7 text-center text-sm font-semibold text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        Carregando cursos...
      </div>
    )
  }

  if (!cursos.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-base font-black text-slate-500 dark:text-slate-300">Nenhum curso encontrado</p>
        <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">
          Tente ajustar os filtros para buscar novamente.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('min-w-0 pr-1', className)}>
      <div className="grid grid-cols-1 gap-3">
        {cursos.map((curso) => {
        const isActive = Boolean(curso.status)
        const vagas = Number(curso.vagas ?? 0)
        const vagasPreenchidas = Number(
          curso.vagas_preenchidas ?? curso.vagaspreenchidas ?? 0,
        )
        const vagasDisponiveis = Math.max(0, vagas - vagasPreenchidas)
        const valor = Number(curso.valor ?? 0)

        return (
          <article
            key={curso.id}
            role="button"
            tabIndex={0}
            onClick={() => onEdit(curso)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onEdit(curso)
              }
            }}
            className="group rounded-2xl border border-slate-200 bg-white transition-all hover:border-indigo-100 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900/60"
          >
            <div className="flex flex-col gap-4 p-4 md:grid md:grid-cols-[2fr_1.6fr_1fr_1fr_auto] md:items-center md:gap-5 md:p-5">
              <div className="min-w-0">
                <h4 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100 md:text-base">
                  {curso.nome}
                </h4>
                <p className="mt-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  Ministrante: {curso.ministrante}
                </p>
                <p className="mt-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 md:hidden">
                  Local: {curso.local || '-'}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 md:flex-col md:gap-1">
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                  Vagas totais: {vagas}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                  Vagas preenchidas: {vagasPreenchidas}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                  Vagas disponiveis: {vagasDisponiveis}
                </span>
              </div>

              <span
                className={`inline-flex w-fit items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                }`}
              >
                {isActive ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                {isActive ? 'Ativo' : 'Inativo'}
              </span>

              <div className="text-sm font-black text-slate-900 dark:text-slate-100">
                {formatCurrency(valor)}
              </div>

              <div className="flex items-center gap-1.5 self-end md:self-auto">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    void handleVisualizarInscricoes(curso)
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-sky-50 hover:text-sky-600 dark:text-slate-500 dark:hover:bg-sky-900/30 dark:hover:text-sky-300"
                  aria-label="Visualizar inscricoes"
                  title="Visualizar inscricoes"
                >
                  <Eye size={16} />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onEdit(curso)
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-500 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300"
                  aria-label="Editar curso"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onDelete(curso)
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-rose-900/30 dark:hover:text-rose-300"
                  aria-label="Excluir curso"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </article>
        )
        })}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[90] flex h-[100dvh] w-screen items-center justify-center overflow-hidden p-4">
          <button
            type="button"
            aria-label="Fechar modal"
            className="absolute inset-0 h-full w-full bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          <div className="relative z-10 flex h-[min(90dvh,820px)] w-full max-w-3xl min-h-0 flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
              <div className="min-w-0">
                <h3 className="truncate text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Inscricoes do curso
                </h3>
                <p className="mt-0.5 truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                  {cursoComInscritos?.nome ?? cursoSelecionado?.nome ?? '-'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto scrollbar-hide bg-slate-50/40 p-4 dark:bg-slate-950/40 md:p-6">
              {isLoadingInscricoes ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  Carregando inscricoes...
                </div>
              ) : inscricoesError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-8 text-center text-sm font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-900/20 dark:text-rose-300">
                  {inscricoesError}
                </div>
              ) : alunosInscritos.length ? (
                alunosInscritos.map((aluno) => {
                  const nome =
                    aluno.perfil_aluno?.nome_completo || aluno.nome_completo || aluno.username || 'Aluno'
                  const inscricao = (aluno as CursoComInscritos['alunos_inscritos'][number]).Inscricao
                  const dataInscricao = inscricao?.data_inscricao
                    ? new Date(inscricao.data_inscricao).toLocaleDateString('pt-BR')
                    : '-'

                  return (
                    <article
                      key={aluno.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {nome}
                          </p>
                          <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                            {aluno.email || 'Sem e-mail'}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            inscricao?.presenca_confirmada
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                          }`}
                        >
                          <UserRound size={12} />
                          {inscricao?.presenca_confirmada ? 'Presenca confirmada' : 'Presenca pendente'}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        <span>ID do aluno: {aluno.id}</span>
                        <span>CPF: {aluno.cpf || '-'}</span>
                        <span>Data da inscricao: {dataInscricao}</span>
                      </div>
                    </article>
                  )
                })
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-base font-semibold text-slate-500 dark:text-slate-300">
                    Nenhum aluno inscrito neste curso
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                    Assim que houver inscricoes, elas aparecerao aqui.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
