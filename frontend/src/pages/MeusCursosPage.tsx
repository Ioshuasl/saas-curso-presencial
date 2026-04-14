import { useEffect, useState } from 'react'
import { CheckCircle2, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'

import { CursoDetalhesModal } from '../components/cursos/CursoDetalhesModal'
import { Button } from '../components/ui/Button'
import { cursoService, inscricaoService } from '../services'
import type { Curso } from '../types'

export function MeusCursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [confirmingCourseId, setConfirmingCourseId] = useState<number | null>(null)
  const [presenceByCourseId, setPresenceByCourseId] = useState<Record<number, boolean>>({})
  const [cursoEmDetalhes, setCursoEmDetalhes] = useState<Curso | null>(null)

  async function loadCursos() {
    setIsLoading(true)
    try {
      const response = await cursoService.listarMeusCursos()
      setCursos(response.data)
      const presenceChecks = await Promise.all(
        response.data.map(async (curso) => {
          try {
            const statusResponse = await inscricaoService.consultarStatusPresenca(curso.id)
            return [curso.id, Boolean(statusResponse.data.presenca_confirmada)] as const
          } catch {
            return [curso.id, false] as const
          }
        }),
      )
      setPresenceByCourseId(Object.fromEntries(presenceChecks))
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Não foi possível carregar seus cursos.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleConfirmarPresenca(cursoId: number) {
    setConfirmingCourseId(cursoId)
    try {
      await inscricaoService.confirmarPresenca(cursoId)
      setPresenceByCourseId((prev) => ({ ...prev, [cursoId]: true }))
      if (import.meta.env.DEV) {
        toast.success('Presença confirmada com sucesso.')
      }
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Não foi possível confirmar a presença agora.')
      }
    } finally {
      setConfirmingCourseId(null)
    }
  }

  useEffect(() => {
    void loadCursos()
  }, [])

  return (
    <section className="scrollbar-hide flex h-full min-h-0 flex-1 flex-col gap-6 overflow-y-auto md:gap-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
            Meus Cursos
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cursos com inscrição aprovada para seu perfil.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          startIcon={<RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} />}
          onClick={() => {
            void loadCursos()
          }}
        >
          Atualizar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cursos.map((curso) => {
          const isPresenceConfirmed = Boolean(presenceByCourseId[curso.id])

          return (
            <article
              key={curso.id}
              role="button"
              tabIndex={0}
              onClick={() => setCursoEmDetalhes(curso)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setCursoEmDetalhes(curso)
                }
              }}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{curso.nome}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Ministrante: {curso.ministrante}
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{curso.local ?? 'Local a confirmar'}</p>

              <Button
                type="button"
                variant="outline"
                className="mt-4"
                isLoading={confirmingCourseId === curso.id}
                disabled={isPresenceConfirmed}
                startIcon={<CheckCircle2 size={16} />}
                onClick={(event) => {
                  event.stopPropagation()
                  void handleConfirmarPresenca(curso.id)
                }}
              >
                {isPresenceConfirmed ? 'Presença já confirmada' : 'Confirmar Presença'}
              </Button>
            </article>
          )
        })}
      </div>
      <CursoDetalhesModal
        curso={cursoEmDetalhes}
        isOpen={Boolean(cursoEmDetalhes)}
        onClose={() => setCursoEmDetalhes(null)}
      />
    </section>
  )
}
