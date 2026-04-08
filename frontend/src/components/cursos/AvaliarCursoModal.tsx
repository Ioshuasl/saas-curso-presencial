import { useEffect, useState } from 'react'
import { ClipboardList, Lock, MessageSquareText, Star, X } from 'lucide-react'
import { toast } from 'sonner'

import type { Curso, CreateFeedbackFinalRequest, CreateQuestionarioInicialRequest } from '../../types'
import { feedbackFinalService, questionarioInicialService } from '../../services'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/TextArea'

type AvaliarCursoModalProps = {
  curso: Curso | null
  isOpen: boolean
  onClose: () => void
}

type QuestionarioForm = Omit<CreateQuestionarioInicialRequest, 'curso_id' | 'tenant_id' | 'aluno_id'>
type FeedbackForm = Omit<CreateFeedbackFinalRequest, 'curso_id' | 'tenant_id'>

const initialQuestionarioForm: QuestionarioForm = {
  maior_dor_inicio: '',
  principal_expectativa: '',
}

const initialFeedbackForm: FeedbackForm = {
  nota: 5,
  depoimento: '',
  impacto: '',
}

export function AvaliarCursoModal({ curso, isOpen, onClose }: AvaliarCursoModalProps) {
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isSavingQuestionario, setIsSavingQuestionario] = useState(false)
  const [isSavingFeedback, setIsSavingFeedback] = useState(false)
  const [questionarioForm, setQuestionarioForm] = useState<QuestionarioForm>(initialQuestionarioForm)
  const [feedbackForm, setFeedbackForm] = useState<FeedbackForm>(initialFeedbackForm)
  const [questionarioInicialRespondido, setQuestionarioInicialRespondido] = useState(false)

  useEffect(() => {
    if (!isOpen || !curso) return

    let isMounted = true
    setIsLoadingData(true)
    setQuestionarioInicialRespondido(false)
    setQuestionarioForm(initialQuestionarioForm)
    setFeedbackForm(initialFeedbackForm)

    void (async () => {
      try {
        const questionarioRes = await questionarioInicialService.buscarQuestionarioPorCurso(curso.id)
        if (!isMounted) return

        setQuestionarioForm({
          maior_dor_inicio: questionarioRes.data.maior_dor_inicio ?? '',
          principal_expectativa: questionarioRes.data.principal_expectativa ?? '',
        })
        setQuestionarioInicialRespondido(true)

        try {
          const feedbackRes = await feedbackFinalService.buscarFeedbackPorCurso(curso.id)
          if (!isMounted) return
          setFeedbackForm({
            nota: feedbackRes.data.nota ?? 5,
            depoimento: feedbackRes.data.depoimento ?? '',
            impacto: feedbackRes.data.impacto ?? '',
          })
        } catch {
          if (!isMounted) return
          setFeedbackForm(initialFeedbackForm)
        }
      } catch {
        if (!isMounted) return
        setQuestionarioInicialRespondido(false)
        setQuestionarioForm(initialQuestionarioForm)
        setFeedbackForm(initialFeedbackForm)
      } finally {
        if (isMounted) {
          setIsLoadingData(false)
        }
      }
    })()

    return () => {
      isMounted = false
    }
  }, [isOpen, curso])

  if (!isOpen || !curso) return null

  async function handleSalvarQuestionario(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const maior = questionarioForm.maior_dor_inicio?.trim() ?? ''
    const expectativa = questionarioForm.principal_expectativa?.trim() ?? ''
    if (maior.length < 3 || expectativa.length < 3) {
      toast.error('Preencha a maior dor e a principal expectativa com pelo menos 3 caracteres.')
      return
    }

    setIsSavingQuestionario(true)
    try {
      await questionarioInicialService.enviarOuAtualizarQuestionario({
        curso_id: curso.id,
        maior_dor_inicio: maior,
        principal_expectativa: expectativa,
      })
      setQuestionarioInicialRespondido(true)
      toast.success('Questionario inicial salvo.')
    } catch {
      toast.error('Nao foi possivel salvar o questionario inicial.')
    } finally {
      setIsSavingQuestionario(false)
    }
  }

  async function handleSalvarFeedback(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!questionarioInicialRespondido) {
      toast.error('Responda e salve o questionario inicial antes do feedback final.')
      return
    }

    setIsSavingFeedback(true)
    try {
      await feedbackFinalService.enviarOuAtualizarFeedback({
        curso_id: curso.id,
        nota: feedbackForm.nota,
        depoimento: feedbackForm.depoimento?.trim(),
        impacto: feedbackForm.impacto?.trim(),
      })
      toast.success('Feedback final salvo.')
    } catch {
      toast.error('Nao foi possivel salvar o feedback final.')
    } finally {
      setIsSavingFeedback(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Fechar modal"
        className="absolute inset-0 bg-slate-900/65 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex h-[94dvh] w-full max-w-6xl min-h-0 flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:h-[90dvh] sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 dark:border-slate-800 sm:px-6">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              <MessageSquareText size={13} />
              Avaliacao do aluno
            </p>
            <h3 className="mt-2 truncate text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">
              {curso.nome}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              Primeiro salve o questionario inicial. Depois disso o feedback final fica disponivel.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60 p-4 dark:bg-slate-950/40 sm:p-6">
          {isLoadingData ? (
            <div className="mb-4 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-900/20 dark:text-indigo-300">
              Carregando dados da avaliacao...
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-6">
            <form
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5"
              onSubmit={(event) => void handleSalvarQuestionario(event)}
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h4 className="inline-flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-100">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                    <ClipboardList size={16} />
                  </span>
                  Questionario inicial
                </h4>
                {questionarioInicialRespondido ? (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                    Concluido
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    Obrigatorio primeiro
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <Textarea
                  label="Maior dor no inicio"
                  rows={4}
                  required
                  minLength={3}
                  value={questionarioForm.maior_dor_inicio}
                  onChange={(event) => {
                    setQuestionarioForm((prev) => ({ ...prev, maior_dor_inicio: event.target.value }))
                  }}
                />
                <Textarea
                  label="Principal expectativa para o curso"
                  rows={4}
                  required
                  minLength={3}
                  value={questionarioForm.principal_expectativa}
                  onChange={(event) => {
                    setQuestionarioForm((prev) => ({ ...prev, principal_expectativa: event.target.value }))
                  }}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="submit" isLoading={isSavingQuestionario}>
                  Salvar questionario inicial
                </Button>
              </div>
            </form>

            <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
              {!questionarioInicialRespondido ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/90 p-4 text-center dark:bg-slate-900/90">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Lock size={18} />
                  </span>
                  <p className="max-w-xs text-sm font-medium text-slate-700 dark:text-slate-200">
                    Salve o questionario inicial para desbloquear o feedback final.
                  </p>
                </div>
              ) : null}

              <form
                className={!questionarioInicialRespondido ? 'pointer-events-none opacity-40' : ''}
                onSubmit={(event) => void handleSalvarFeedback(event)}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h4 className="inline-flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-100">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
                      <Star size={16} />
                    </span>
                    Feedback final
                  </h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Nota (1 a 5)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      disabled={!questionarioInicialRespondido}
                      value={feedbackForm.nota}
                      onChange={(event) => {
                        const value = Number(event.target.value)
                        setFeedbackForm((prev) => ({ ...prev, nota: Number.isNaN(value) ? 5 : value }))
                      }}
                      className="h-11 w-28 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>

                  <Textarea
                    label="Depoimento"
                    rows={4}
                    disabled={!questionarioInicialRespondido}
                    value={feedbackForm.depoimento ?? ''}
                    onChange={(event) => {
                      setFeedbackForm((prev) => ({ ...prev, depoimento: event.target.value }))
                    }}
                  />
                  <Textarea
                    label="Impacto do aprendizado"
                    rows={4}
                    disabled={!questionarioInicialRespondido}
                    value={feedbackForm.impacto ?? ''}
                    onChange={(event) => {
                      setFeedbackForm((prev) => ({ ...prev, impacto: event.target.value }))
                    }}
                  />
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    type="submit"
                    isLoading={isSavingFeedback}
                    disabled={!questionarioInicialRespondido}
                  >
                    Salvar feedback final
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}
