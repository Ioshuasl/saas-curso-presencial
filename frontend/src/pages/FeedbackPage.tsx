import { useEffect, useState, type FormEvent } from 'react'
import { Lock } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/TextArea'
import { cursoService, feedbackFinalService, questionarioInicialService } from '../services'
import type { Curso } from '../types'

type QuestionarioForm = {
  maior_dor_inicio: string
  principal_expectativa: string
}

type FeedbackForm = {
  nota: number
  depoimento: string
  impacto: string
}

export function FeedbackPage() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [selectedCursoId, setSelectedCursoId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingQuestionario, setIsSubmittingQuestionario] = useState(false)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [questionarioInicialRespondido, setQuestionarioInicialRespondido] = useState(false)
  const [questionarioForm, setQuestionarioForm] = useState<QuestionarioForm>({
    maior_dor_inicio: '',
    principal_expectativa: '',
  })
  const [feedbackForm, setFeedbackForm] = useState<FeedbackForm>({
    nota: 5,
    depoimento: '',
    impacto: '',
  })

  async function loadCursos() {
    setIsLoading(true)
    try {
      const response = await cursoService.listarMeusCursos()
      setCursos(response.data)
      setSelectedCursoId((prev) => prev ?? response.data[0]?.id ?? null)
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Nao foi possivel carregar seus cursos para feedback.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function loadExistingResponses(cursoId: number) {
    setQuestionarioInicialRespondido(false)
    setQuestionarioForm({ maior_dor_inicio: '', principal_expectativa: '' })
    setFeedbackForm({ nota: 5, depoimento: '', impacto: '' })

    try {
      const questionarioResponse = await questionarioInicialService.buscarQuestionarioPorCurso(cursoId)
      setQuestionarioForm({
        maior_dor_inicio: questionarioResponse.data.maior_dor_inicio ?? '',
        principal_expectativa: questionarioResponse.data.principal_expectativa ?? '',
      })
      setQuestionarioInicialRespondido(true)

      try {
        const feedbackResponse = await feedbackFinalService.buscarFeedbackPorCurso(cursoId)
        setFeedbackForm({
          nota: feedbackResponse.data.nota ?? 5,
          depoimento: feedbackResponse.data.depoimento ?? '',
          impacto: feedbackResponse.data.impacto ?? '',
        })
      } catch {
        setFeedbackForm({ nota: 5, depoimento: '', impacto: '' })
      }
    } catch {
      setQuestionarioInicialRespondido(false)
      setQuestionarioForm({ maior_dor_inicio: '', principal_expectativa: '' })
      setFeedbackForm({ nota: 5, depoimento: '', impacto: '' })
    }
  }

  async function handleSubmitQuestionario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedCursoId) return

    const maior = questionarioForm.maior_dor_inicio.trim()
    const expectativa = questionarioForm.principal_expectativa.trim()
    if (maior.length < 3 || expectativa.length < 3) {
      toast.error('Preencha a maior dor e a principal expectativa com pelo menos 3 caracteres.')
      return
    }

    setIsSubmittingQuestionario(true)
    try {
      await questionarioInicialService.enviarOuAtualizarQuestionario({
        curso_id: selectedCursoId,
        maior_dor_inicio: maior,
        principal_expectativa: expectativa,
      })
      setQuestionarioInicialRespondido(true)
      if (import.meta.env.DEV) {
        toast.success('Questionario inicial enviado com sucesso.')
      }
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Nao foi possivel enviar o questionario inicial.')
      }
    } finally {
      setIsSubmittingQuestionario(false)
    }
  }

  async function handleSubmitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedCursoId) return

    if (!questionarioInicialRespondido) {
      toast.error('Responda e salve o questionario inicial antes do feedback final.')
      return
    }

    setIsSubmittingFeedback(true)
    try {
      await feedbackFinalService.enviarOuAtualizarFeedback({
        curso_id: selectedCursoId,
        nota: feedbackForm.nota,
        depoimento: feedbackForm.depoimento.trim(),
        impacto: feedbackForm.impacto.trim(),
      })
      if (import.meta.env.DEV) {
        toast.success('Feedback final enviado com sucesso.')
      }
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Nao foi possivel enviar o feedback final.')
      }
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  useEffect(() => {
    void loadCursos()
  }, [])

  useEffect(() => {
    if (!selectedCursoId) return
    void loadExistingResponses(selectedCursoId)
  }, [selectedCursoId])

  return (
    <section className="scrollbar-hide flex h-full min-h-0 flex-1 flex-col gap-6 overflow-y-auto md:gap-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
          Feedback e Questionarios
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Primeiro responda o questionario inicial; depois o feedback final fica disponivel.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Curso
        </label>
        <select
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
          disabled={isLoading || cursos.length === 0}
          value={selectedCursoId ?? ''}
          onChange={(event) => {
            const parsed = Number(event.target.value)
            setSelectedCursoId(Number.isNaN(parsed) ? null : parsed)
          }}
        >
          {cursos.map((curso) => (
            <option key={curso.id} value={curso.id}>
              {curso.nome}
            </option>
          ))}
        </select>
      </div>

      <form
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
        onSubmit={(event) => {
          void handleSubmitQuestionario(event)
        }}
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Questionario inicial</h3>
        <Textarea
          label="Maior dor no inicio"
          rows={3}
          required
          minLength={3}
          value={questionarioForm.maior_dor_inicio}
          onChange={(event) => {
            setQuestionarioForm((prev) => ({ ...prev, maior_dor_inicio: event.target.value }))
          }}
        />
        <Textarea
          label="Principal expectativa para o curso"
          rows={3}
          required
          minLength={3}
          value={questionarioForm.principal_expectativa}
          onChange={(event) => {
            setQuestionarioForm((prev) => ({ ...prev, principal_expectativa: event.target.value }))
          }}
        />
        <Button type="submit" isLoading={isSubmittingQuestionario} disabled={!selectedCursoId}>
          Salvar questionario inicial
        </Button>
      </form>

      <div className="relative rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        {!questionarioInicialRespondido ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/90 p-4 text-center dark:bg-slate-900/90">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Lock size={18} />
            </span>
            <p className="max-w-sm text-sm font-medium text-slate-700 dark:text-slate-200">
              Salve o questionario inicial deste curso para desbloquear o feedback final.
            </p>
          </div>
        ) : null}

        <form
          className={`space-y-4 ${!questionarioInicialRespondido ? 'pointer-events-none opacity-40' : ''}`}
          onSubmit={(event) => {
            void handleSubmitFeedback(event)
          }}
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Feedback final</h3>

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
              className="h-10 w-24 rounded-md border border-slate-300 bg-white px-3 text-sm disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-900"
            />
          </div>

          <Textarea
            label="Depoimento"
            rows={3}
            disabled={!questionarioInicialRespondido}
            value={feedbackForm.depoimento}
            onChange={(event) => {
              setFeedbackForm((prev) => ({ ...prev, depoimento: event.target.value }))
            }}
          />
          <Textarea
            label="Impacto do aprendizado"
            rows={3}
            disabled={!questionarioInicialRespondido}
            value={feedbackForm.impacto}
            onChange={(event) => {
              setFeedbackForm((prev) => ({ ...prev, impacto: event.target.value }))
            }}
          />

          <Button
            type="submit"
            isLoading={isSubmittingFeedback}
            disabled={!selectedCursoId || !questionarioInicialRespondido}
          >
            Salvar feedback final
          </Button>
        </form>
      </div>
    </section>
  )
}
