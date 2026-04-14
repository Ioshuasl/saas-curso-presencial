import { useEffect, useState } from 'react'
import { Save, X } from 'lucide-react'

import type { Aluno, Curso } from '../../types'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'

type AdminInscricaoFormProps = {
  isOpen: boolean
  cursos: Curso[]
  alunos: Aluno[]
  isSubmitting: boolean
  defaultCursoId?: number | null
  onSubmit: (payload: { curso_id: number; aluno_id: number }) => Promise<void>
  onClose: () => void
}

export function AdminInscricaoForm({
  isOpen,
  cursos,
  alunos,
  isSubmitting,
  defaultCursoId = null,
  onSubmit,
  onClose,
}: AdminInscricaoFormProps) {
  const [cursoId, setCursoId] = useState<number | null>(defaultCursoId)
  const [alunoId, setAlunoId] = useState<number | null>(null)
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [isVisible, setIsVisible] = useState(false)
  const cursoOptions = cursos.map((curso) => ({
    label: curso.nome,
    value: curso.id,
    description: curso.ministrante || undefined,
  }))
  const alunoOptions = alunos.map((aluno) => ({
    label: aluno.perfil_aluno?.nome_completo || aluno.nome_completo || aluno.username,
    value: aluno.id,
    description: aluno.email || undefined,
  }))

  useEffect(() => {
    if (!isOpen) return
    setCursoId(defaultCursoId ?? cursos[0]?.id ?? null)
    setAlunoId(null)
  }, [isOpen, defaultCursoId, cursos])

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      const timeout = window.setTimeout(() => setIsVisible(true), 40)
      return () => window.clearTimeout(timeout)
    }

    setIsVisible(false)
    const timeout = window.setTimeout(() => setShouldRender(false), 400)
    return () => window.clearTimeout(timeout)
  }, [isOpen])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!cursoId || !alunoId) return
    await onSubmit({ curso_id: cursoId, aluno_id: alunoId })
  }

  if (!shouldRender) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-slate-900/55 p-0 backdrop-blur-sm transition sm:items-center sm:p-4 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <form
        onSubmit={(event) => {
          void handleSubmit(event)
        }}
        onClick={(event) => event.stopPropagation()}
        className={`flex w-full max-w-xl flex-col gap-5 rounded-t-3xl border border-slate-200 bg-white p-5 transition-all dark:border-slate-800 dark:bg-slate-900 sm:rounded-3xl sm:p-6 ${
          isVisible ? 'translate-y-0' : 'translate-y-8'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Nova inscrição</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Selecione o curso e o aluno para cadastrar.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <Select
            label="Curso"
            value={cursoId ?? ''}
            onChange={(value) => {
              const parsed = Number(value)
              setCursoId(Number.isNaN(parsed) ? null : parsed)
            }}
            options={cursoOptions}
            placeholder="Selecione um curso"
            required
            searchable
          />

          <Select
            label="Aluno"
            value={alunoId ?? ''}
            onChange={(value) => {
              const parsed = Number(value)
              setAlunoId(Number.isNaN(parsed) ? null : parsed)
            }}
            options={alunoOptions}
            placeholder="Selecione um aluno"
            required
            searchable
          />
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            startIcon={<Save size={16} />}
            disabled={!cursoId || !alunoId}
          >
            Salvar inscrição
          </Button>
        </div>
      </form>
    </div>
  )
}
