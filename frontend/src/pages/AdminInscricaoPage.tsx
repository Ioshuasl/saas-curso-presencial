import { ClipboardPlus, RefreshCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { AdminInscricaoForm, AdminInscricaoList } from '../components'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { cursoService, inscricaoService, usuarioService } from '../services'
import type { Aluno, Curso, CursoComInscritos } from '../types'

export function AdminInscricaoPage() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [selectedCursoId, setSelectedCursoId] = useState<number | null>(null)
  const [cursoComInscritos, setCursoComInscritos] = useState<CursoComInscritos | null>(null)
  const [isLoadingBase, setIsLoadingBase] = useState(true)
  const [isLoadingInscricoes, setIsLoadingInscricoes] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalInscritos = cursoComInscritos?.alunos_inscritos?.length ?? 0
  const cursoOptions = cursos.map((curso) => ({
    label: curso.nome,
    value: curso.id,
    description: curso.ministrante || undefined,
  }))

  const alunosDisponiveisParaInscricao = useMemo(() => {
    if (!cursoComInscritos) return alunos
    const inscritos = new Set((cursoComInscritos.alunos_inscritos ?? []).map((a) => a.id))
    return alunos.filter((aluno) => !inscritos.has(aluno.id))
  }, [alunos, cursoComInscritos])

  async function loadBaseData() {
    setIsLoadingBase(true)
    try {
      const [cursosResponse, alunosResponse] = await Promise.all([
        cursoService.listarCursos({ page: 1, limit: 100 }),
        usuarioService.listarAlunos({ page: 1, limit: 200 }),
      ])
      const cursosList = cursosResponse.data.data
      setCursos(cursosList)
      setAlunos(alunosResponse.data.data)
      setSelectedCursoId((prev) => prev ?? cursosList[0]?.id ?? null)
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Nao foi possivel carregar os dados de inscricoes.')
      }
    } finally {
      setIsLoadingBase(false)
    }
  }

  async function loadInscricoesByCurso(cursoId: number) {
    setIsLoadingInscricoes(true)
    try {
      const response = await inscricaoService.listarInscricoesPorCurso(cursoId)
      setCursoComInscritos(response.data)
    } catch {
      setCursoComInscritos(null)
      if (import.meta.env.DEV) {
        toast.error('Nao foi possivel carregar as inscricoes do curso selecionado.')
      }
    } finally {
      setIsLoadingInscricoes(false)
    }
  }

  useEffect(() => {
    void loadBaseData()
  }, [])

  useEffect(() => {
    if (!selectedCursoId) return
    void loadInscricoesByCurso(selectedCursoId)
  }, [selectedCursoId])

  async function handleCriarInscricao(payload: { curso_id: number; aluno_id: number }) {
    setIsSubmitting(true)
    try {
      await inscricaoService.criarInscricao(payload)
      if (import.meta.env.DEV) {
        toast.success('Inscricao criada com sucesso.')
      }
      setIsFormOpen(false)
      await loadInscricoesByCurso(payload.curso_id)
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Nao foi possivel criar a inscricao.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleConfirmarPresenca(alunoId: number) {
    if (!selectedCursoId) return
    try {
      await inscricaoService.confirmarPresenca(selectedCursoId, alunoId)
      if (import.meta.env.DEV) {
        toast.success('Presenca confirmada com sucesso.')
      }
      await loadInscricoesByCurso(selectedCursoId)
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Nao foi possivel confirmar a presenca.')
      }
    }
  }

  async function handleRemoverInscricao(alunoId: number, alunoNome: string) {
    if (!selectedCursoId) return
    const confirmed = window.confirm(`Deseja remover a inscricao de "${alunoNome}"?`)
    if (!confirmed) return

    try {
      await inscricaoService.removerInscricao(selectedCursoId, alunoId)
      if (import.meta.env.DEV) {
        toast.success('Inscricao removida com sucesso.')
      }
      await loadInscricoesByCurso(selectedCursoId)
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Nao foi possivel remover a inscricao.')
      }
    }
  }

  return (
    <section className="scrollbar-hide flex h-full min-h-0 flex-1 flex-col gap-6 overflow-y-auto md:gap-8">
      <div className="shrink-0 space-y-6">
        <div className="flex flex-col gap-4 px-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
              Inscricoes
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Gerencie a matricula de alunos nos cursos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                void loadBaseData()
                if (selectedCursoId) {
                  void loadInscricoesByCurso(selectedCursoId)
                }
              }}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-indigo-900 dark:hover:text-indigo-300"
              title="Sincronizar dados"
              aria-label="Sincronizar dados"
            >
              <RefreshCcw size={18} className={isLoadingBase || isLoadingInscricoes ? 'animate-spin' : ''} />
            </button>
            <Button
              type="button"
              startIcon={<ClipboardPlus size={18} />}
              onClick={() => setIsFormOpen(true)}
              className="rounded-2xl px-6 py-3 text-sm font-bold shadow-xl shadow-indigo-200/40 dark:shadow-indigo-950/40"
            >
              Nova inscricao
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <Select
              label="Curso selecionado"
              value={selectedCursoId ?? ''}
              onChange={(value) => {
                const parsed = Number(value)
                setSelectedCursoId(Number.isNaN(parsed) ? null : parsed)
              }}
              options={cursoOptions}
              placeholder="Selecione um curso"
              disabled={isLoadingBase || cursos.length === 0}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total de inscritos
            </p>
            <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">{totalInscritos}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              no curso {cursoComInscritos?.nome ?? '-'}
            </p>
          </div>
        </div>
      </div>

      <AdminInscricaoForm
        isOpen={isFormOpen}
        cursos={cursos}
        alunos={alunosDisponiveisParaInscricao}
        isSubmitting={isSubmitting}
        defaultCursoId={selectedCursoId}
        onSubmit={handleCriarInscricao}
        onClose={() => setIsFormOpen(false)}
      />

      <AdminInscricaoList
        curso={cursoComInscritos}
        isLoading={isLoadingBase || isLoadingInscricoes}
        onConfirmarPresenca={handleConfirmarPresenca}
        onRemoverInscricao={handleRemoverInscricao}
      />
    </section>
  )
}
