import { useEffect, useState } from 'react'
import { CalendarDays, Clock3, MapPin, UserRound, X } from 'lucide-react'

import type { Curso } from '../../types'
import { Button } from '../ui/Button'

type CursoDetalhesModalProps = {
  curso: Curso | null
  isOpen: boolean
  onClose: () => void
}

function formatDate(value?: string) {
  if (!value) return 'Data a confirmar'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('pt-BR')
}

function formatTimeRange(start?: string, end?: string) {
  if (!start && !end) return 'Horário a confirmar'
  if (start && end) return `${start} - ${end}`
  return start ?? end ?? 'Horário a confirmar'
}

function extractTopics(conteudo?: string | null) {
  if (!conteudo) return []
  return conteudo
    .split(/\r?\n|;|•|-/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

export function CursoDetalhesModal({ curso, isOpen, onClose }: CursoDetalhesModalProps) {
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [isVisible, setIsVisible] = useState(false)
  const [activeCurso, setActiveCurso] = useState<Curso | null>(curso)

  useEffect(() => {
    if (isOpen && curso) {
      setActiveCurso(curso)
      setShouldRender(true)
      const timeout = window.setTimeout(() => {
        setIsVisible(true)
      }, 40)
      return () => window.clearTimeout(timeout)
    }

    setIsVisible(false)
    const timeout = window.setTimeout(() => {
      setShouldRender(false)
      setActiveCurso(null)
    }, 700)
    return () => window.clearTimeout(timeout)
  }, [isOpen, curso])

  useEffect(() => {
    if (!shouldRender) return
    function handleEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [shouldRender, onClose])

  if (!shouldRender || !activeCurso) return null

  const topics = extractTopics(activeCurso.conteudo)
  const hasImage = Boolean(activeCurso.url_imagem)

  return (
    <div
      className={`fixed inset-0 z-[80] flex h-[100dvh] w-screen items-end justify-center overflow-hidden p-0 backdrop-blur-sm transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:items-center sm:p-4 ${
        isVisible ? 'bg-slate-950/70 opacity-100' : 'bg-slate-950/0 opacity-0'
      }`}
      onClick={onClose}
    >

      <div
        onClick={(event) => event.stopPropagation()}
        className={`relative z-10 flex h-[94dvh] w-full max-w-5xl min-h-0 flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform dark:border-slate-800 dark:bg-slate-900 sm:h-auto sm:max-h-[90dvh] sm:rounded-3xl ${
          isVisible ? 'translate-y-0 opacity-100 sm:scale-100' : 'translate-y-16 opacity-0 sm:translate-y-4 sm:scale-[0.97]'
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
          <div className="min-w-0">
            <p className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-900/40 dark:text-indigo-300">
              Detalhes do curso
            </p>
            <h3 className="mt-2 truncate text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">
              {activeCurso.nome}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              Visualize as informações principais antes de decidir pela inscrição.
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

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950/30 sm:p-6">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="space-y-4 xl:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                {hasImage ? (
                  <img
                    src={activeCurso.url_imagem ?? ''}
                    alt={activeCurso.nome}
                    className="h-52 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-cyan-100 px-6 text-center dark:from-indigo-900/50 dark:via-slate-900 dark:to-cyan-900/40">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      Imagem do curso será exibida aqui.
                    </p>
                  </div>
                )}
                <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                  <p className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <UserRound size={16} className="mt-0.5 text-indigo-500" />
                    <span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Ministrante:</span>{' '}
                      {activeCurso.ministrante}
                    </span>
                  </p>
                  <p className="mt-2 flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <MapPin size={16} className="mt-0.5 text-indigo-500" />
                    <span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Local:</span>{' '}
                      {activeCurso.local ?? 'A confirmar'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 xl:col-span-7">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Sobre o curso
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {activeCurso.descricao ?? 'Descrição será disponibilizada em breve.'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Conteúdo programático
                </h4>
                {topics.length > 0 ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {topics.map((topic, index) => (
                      <div
                        key={`${topic}-${index}`}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
                      >
                        {topic}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    Conteúdo em atualização.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sessões previstas
            </h4>
            {activeCurso.sessoes && activeCurso.sessoes.length > 0 ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {activeCurso.sessoes.map((sessao) => (
                  <div
                    key={sessao.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70"
                  >
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <CalendarDays size={14} className="text-indigo-500" />
                      {formatDate(sessao.data)}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Clock3 size={13} className="text-indigo-500" />
                      {formatTimeRange(sessao.horario_inicio, sessao.horario_fim)}
                    </p>
                    {sessao.local ? (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Local: {sessao.local}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Ainda não há sessões cadastradas para este curso.
              </p>
            )}
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

