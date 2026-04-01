import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/TextArea'
import { cursoService, feedbackFinalService, questionarioInicialService } from '../services'
import type { Curso } from '../types'

type QuestionarioForm = {
  dores: string
  expectativas: string
  objetivo_principal: string
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
  const [questionarioForm, setQuestionarioForm] = useState<QuestionarioForm>({
    dores: '',
    expectativas: '',
    objetivo_principal: '',
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
    try {
      const [questionarioResponse, feedbackResponse] = await Promise.allSettled([
        questionarioInicialService.buscarQuestionarioPorCurso(cursoId),
        feedbackFinalService.buscarFeedbackPorCurso(cursoId),
      ])

      if (questionarioResponse.status === 'fulfilled') {
        setQuestionarioForm({
          dores: questionarioResponse.value.data.dores ?? '',
          expectativas: questionarioResponse.value.data.expectativas ?? '',
          objetivo_principal: questionarioResponse.value.data.objetivo_principal ?? '',
        })
      } else {
        setQuestionarioForm({ dores: '', expectativas: '', objetivo_principal: '' })
      }

      if (feedbackResponse.status === 'fulfilled') {
        setFeedbackForm({
          nota: feedbackResponse.value.data.nota ?? 5,
          depoimento: feedbackResponse.value.data.depoimento ?? '',
          impacto: feedbackResponse.value.data.impacto ?? '',
        })
      } else {
        setFeedbackForm({ nota: 5, depoimento: '', impacto: '' })
      }
    } catch {
      setQuestionarioForm({ dores: '', expectativas: '', objetivo_principal: '' })
      setFeedbackForm({ nota: 5, depoimento: '', impacto: '' })
    }
  }

  async function handleSubmitQuestionario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedCursoId) return

    setIsSubmittingQuestionario(true)
    try {
      await questionarioInicialService.enviarOuAtualizarQuestionario({
        curso_id: selectedCursoId,
        dores: questionarioForm.dores.trim(),
        expectativas: questionarioForm.expectativas.trim(),
        objetivo_principal: questionarioForm.objetivo_principal.trim(),
      })
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
          Compartilhe expectativas no inicio e avalie os resultados ao final.
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
          label="Quais suas maiores dores?"
          rows={3}
          value={questionarioForm.dores}
          onChange={(event) => {
            setQuestionarioForm((prev) => ({ ...prev, dores: event.target.value }))
          }}
        />
        <Textarea
          label="Quais suas expectativas para o curso?"
          rows={3}
          value={questionarioForm.expectativas}
          onChange={(event) => {
            setQuestionarioForm((prev) => ({ ...prev, expectativas: event.target.value }))
          }}
        />
        <Textarea
          label="Objetivo principal"
          rows={3}
          value={questionarioForm.objetivo_principal}
          onChange={(event) => {
            setQuestionarioForm((prev) => ({ ...prev, objetivo_principal: event.target.value }))
          }}
        />
        <Button type="submit" isLoading={isSubmittingQuestionario} disabled={!selectedCursoId}>
          Salvar questionario inicial
        </Button>
      </form>

      <form
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
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
            value={feedbackForm.nota}
            onChange={(event) => {
              const value = Number(event.target.value)
              setFeedbackForm((prev) => ({ ...prev, nota: Number.isNaN(value) ? 5 : value }))
            }}
            className="h-10 w-24 rounded-md border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <Textarea
          label="Depoimento"
          rows={3}
          value={feedbackForm.depoimento}
          onChange={(event) => {
            setFeedbackForm((prev) => ({ ...prev, depoimento: event.target.value }))
          }}
        />
        <Textarea
          label="Impacto do aprendizado"
          rows={3}
          value={feedbackForm.impacto}
          onChange={(event) => {
            setFeedbackForm((prev) => ({ ...prev, impacto: event.target.value }))
          }}
        />

        <Button type="submit" isLoading={isSubmittingFeedback} disabled={!selectedCursoId}>
          Salvar feedback final
        </Button>
      </form>
    </section>
  )
}
