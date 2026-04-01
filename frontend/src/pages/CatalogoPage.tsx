import { useEffect, useState } from 'react'
import { ExternalLink, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'

import { asRecord } from '../components/tenantConfig/tenantConfigUtils'
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
  const [whatsappDigits, setWhatsappDigits] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function loadData() {
    setIsLoading(true)
    try {
      const cursosResponse = await cursoService.listarCursos({ page: 1, limit: 50, status: true })
      setCursos(cursosResponse.data.data)

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

  return (
    <section className="scrollbar-hide flex h-full min-h-0 flex-1 flex-col gap-6 overflow-y-auto md:gap-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
            Catalogo de Cursos
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Consulte os cursos disponiveis. Use o WhatsApp para tirar duvidas ou demonstrar interesse; a
            matricula no sistema e feita pela equipe apos alinhar valores com o atendimento.
          </p>
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cursos.map((curso) => (
          <article
            key={curso.id}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
          >
            {curso.url_imagem ? (
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${curso.url_imagem})` }}
                aria-hidden
              />
            ) : null}
            <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/88" aria-hidden />

            <div className="relative z-10">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{curso.nome}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{curso.ministrante}</p>
              <p className="mt-3 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">
                {curso.descricao ?? 'Descricao sera disponibilizada em breve.'}
              </p>

              <div className="mt-4 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                <p>
                  <span className="font-semibold">Valor:</span> {formatCurrency(curso.valor)}
                </p>
                <p>
                  <span className="font-semibold">Local:</span> {curso.local ?? 'A confirmar'}
                </p>
              </div>

              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                A inscricao no sistema e feita pelo administrador apos combinarem valores e condicoes.
              </p>

              <div className="mt-4">
                <Button
                  type="button"
                  fullWidth
                  startIcon={<ExternalLink size={16} />}
                  onClick={() => handleWhatsAppContato(curso)}
                >
                  Inscrever via WhatsApp
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
