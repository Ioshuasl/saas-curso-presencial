import { useEffect, useState } from 'react'
import { ExternalLink, MapPin, RefreshCcw, Sparkles, Users } from 'lucide-react'
import { toast } from 'sonner'

import { asRecord } from '../components/tenantConfig/tenantConfigUtils'
import { AvaliarCursoModal } from '../components/cursos/AvaliarCursoModal'
import { Button } from '../components/ui/Button'
import { authService, configService, cursoService } from '../services'
import type { Curso } from '../types'
import { phoneToWhatsAppDigits } from '../utils'

function formatCurrency(value?: number) {
  if (typeof value !== 'number') return 'Valor sob consulta'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function CatalogoPage() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<number>>(new Set())
  const [cursoEmAvaliacao, setCursoEmAvaliacao] = useState<Curso | null>(null)
  const [whatsappDigits, setWhatsappDigits] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function loadData() {
    setIsLoading(true)
    try {
      const cursosResponse = await cursoService.listarCursos({ page: 1, limit: 50, status: true })
      setCursos(cursosResponse.data.data)
      try {
        const meusCursosResponse = await cursoService.listarMeusCursos()
        setEnrolledCourseIds(new Set(meusCursosResponse.data.map((curso) => curso.id)))
      } catch {
        setEnrolledCourseIds(new Set())
      }

      const tenantId = authService.getSession()?.tenantId
      if (tenantId) {
        try {
          const cfgRes = await configService.buscarConfigPorTenant(tenantId)
          const settings = asRecord(cfgRes.data?.settings)
          const profile = asRecord(settings.tenantProfile)
          setWhatsappDigits(phoneToWhatsAppDigits(String(profile.telefone ?? '')))
        } catch {
          setWhatsappDigits(null)
        }
      } else {
        setWhatsappDigits(null)
      }
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Nao foi possivel carregar o catalogo de cursos.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  function handleWhatsAppContato(curso: Curso) {
    if (!whatsappDigits) {
      toast.error(
        'Telefone WhatsApp do tenant nao configurado. Um administrador pode informar em Configuracoes > Dados gerais.',
      )
      return
    }
    const text = encodeURIComponent(
      `Ola! Tenho interesse no curso "${curso.nome}" e gostaria de mais informacoes para dar continuidade.`,
    )
    window.open(`https://wa.me/${whatsappDigits}?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    void loadData()
  }, [])

  const totalCursos = cursos.length
  const totalInscritos = enrolledCourseIds.size

  return (
    <>
      <section className="scrollbar-hide flex h-full min-h-0 flex-1 flex-col gap-6 overflow-y-auto md:gap-8">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-indigo-50 p-5 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 md:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/20" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-400/20" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                <Sparkles size={14} />
                Area do aluno
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
                Catalogo de Cursos
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Explore trilhas de formacao com uma experiencia mais clara e objetiva. Use o WhatsApp para
                demonstrar interesse em novos cursos, ou avalie os cursos em que voce ja esta inscrito.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/70">
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Cursos</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{totalCursos}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/70">
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Inscritos</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{totalInscritos}</p>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                startIcon={<RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} />}
                onClick={() => {
                  void loadData()
                }}
              >
                Atualizar
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cursos.map((curso) => {
            const isEnrolled = enrolledCourseIds.has(curso.id)

            return (
              <article
                key={curso.id}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                {curso.url_imagem ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 transition duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${curso.url_imagem})` }}
                    aria-hidden
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/94 to-white/98 dark:from-slate-900/95 dark:via-slate-900/94 dark:to-slate-900/98" aria-hidden />

                <div className="relative z-10">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{curso.nome}</h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{curso.ministrante}</p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        isEnrolled
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                      }`}
                    >
                      {isEnrolled ? 'Inscrito' : 'Disponivel'}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">
                    {curso.descricao ?? 'Descricao sera disponibilizada em breve.'}
                  </p>

                  <div className="mt-5 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <p className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                        <Users size={14} />
                      </span>
                      <span>
                        <span className="font-semibold">Valor:</span> {formatCurrency(curso.valor)}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                        <MapPin size={14} />
                      </span>
                      <span>
                        <span className="font-semibold">Local:</span> {curso.local ?? 'A confirmar'}
                      </span>
                    </p>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {isEnrolled
                      ? 'Voce ja participa deste curso. Clique para registrar seu questionario e feedback.'
                      : 'A inscricao e realizada pelo atendimento apos o contato e alinhamento das condicoes.'}
                  </p>

                  <div className="mt-4">
                    <Button
                      type="button"
                      fullWidth
                      startIcon={<ExternalLink size={15} />}
                      onClick={() => {
                        if (isEnrolled) {
                          setCursoEmAvaliacao(curso)
                          return
                        }
                        handleWhatsAppContato(curso)
                      }}
                    >
                      {isEnrolled ? 'Avaliar curso' : 'Inscrever via WhatsApp'}
                    </Button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {!isLoading && cursos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
            Nenhum curso disponivel no momento.
          </div>
        ) : null}
      </section>

      <AvaliarCursoModal
        curso={cursoEmAvaliacao}
        isOpen={Boolean(cursoEmAvaliacao)}
        onClose={() => setCursoEmAvaliacao(null)}
      />
    </>
  )
}
