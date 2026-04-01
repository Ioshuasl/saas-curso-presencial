import { useEffect, useState } from 'react'
import { RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '../components/ui/Button'
import { inscricaoService } from '../services'
import type { Curso } from '../types'

function resolveStatusLabel(curso: Curso) {
  const rawStatus =
    (curso as Curso & { status_pagamento?: string }).status_pagamento ??
    ((curso as Curso & { inscricao?: { status_pagamento?: string } }).inscricao?.status_pagamento || '')
  const status = String(rawStatus).toUpperCase()

  if (status === 'APROVADO') return 'Aprovado'
  if (status === 'REPROVADO') return 'Reprovado'
  if (status === 'PENDENTE') return 'Pendente'
  return 'Em analise'
}

export function PagamentosPage() {
  const [inscricoes, setInscricoes] = useState<Curso[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function loadInscricoes() {
    setIsLoading(true)
    try {
      const response = await inscricaoService.listarMinhasInscricoes()
      setInscricoes(response.data)
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Nao foi possivel carregar o status dos pagamentos.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadInscricoes()
  }, [])

  return (
    <section className="scrollbar-hide flex h-full min-h-0 flex-1 flex-col gap-6 overflow-y-auto md:gap-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
            Pagamentos
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Acompanhe o status de validacao dos seus comprovantes.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          startIcon={<RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} />}
          onClick={() => {
            void loadInscricoes()
          }}
        >
          Atualizar
        </Button>
      </div>

      <div className="space-y-3">
        {inscricoes.map((curso) => {
          const statusLabel = resolveStatusLabel(curso)
          const statusColor =
            statusLabel === 'Aprovado'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
              : statusLabel === 'Reprovado'
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'

          return (
            <article
              key={curso.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
            >
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{curso.nome}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{curso.ministrante}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor}`}>
                {statusLabel}
              </span>
            </article>
          )
        })}
      </div>
    </section>
  )
}
