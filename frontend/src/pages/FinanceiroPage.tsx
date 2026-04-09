import { ArrowDownCircle, ArrowUpCircle, RefreshCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  ContaPagarForm,
  ContaReceberForm,
  FinanceiroFilters,
  TransactionList,
  type FinanceiroFilterValue,
  mapContaPagarToTransaction,
  mapContaReceberToTransaction,
} from '../components'
import { Button } from '../components/ui/Button'
import { PaginationFooter } from '../components/ui/PaginationFooter'
import { contaPagarService, contaReceberService } from '../services'
import type {
  ContaPagar,
  ContaReceber,
  CreateContaPagarRequest,
  CreateContaReceberRequest,
  UpdateContaPagarRequest,
  UpdateContaReceberRequest,
} from '../types'

type FilterState = FinanceiroFilterValue
type UnifiedStatusFilter = Exclude<FinanceiroFilterValue['status'], 'ALL'>

const PAGE_SIZE = 10

function normalizeStatus(status: string): UnifiedStatusFilter {
  const normalized = String(status ?? '').toUpperCase()
  if (normalized === 'PAGO' || normalized === 'PAID' || normalized === 'LIQUIDADO') return 'PAGO'
  if (normalized === 'PARCIAL') return 'PARCIAL'
  if (normalized === 'ATRASADO' || normalized === 'VENCIDO') return 'ATRASADO'
  return 'PENDENTE'
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

function isInRange(date: Date | null, from: Date | null, to: Date | null) {
  if (!date) return false
  if (from && date < from) return false
  if (to) {
    const toEnd = new Date(to)
    toEnd.setHours(23, 59, 59, 999)
    if (date > toEnd) return false
  }
  return true
}

export function FinanceiroPage() {
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>([])
  const [contasReceber, setContasReceber] = useState<ContaReceber[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingPagar, setIsSubmittingPagar] = useState(false)
  const [isSubmittingReceber, setIsSubmittingReceber] = useState(false)
  const [isContaPagarFormOpen, setIsContaPagarFormOpen] = useState(false)
  const [isContaReceberFormOpen, setIsContaReceberFormOpen] = useState(false)
  const [selectedContaPagar, setSelectedContaPagar] = useState<ContaPagar | null>(null)
  const [selectedContaReceber, setSelectedContaReceber] = useState<ContaReceber | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'ALL',
    status: 'ALL',
    dateFrom: null,
    dateTo: null,
  })

  async function loadFinanceiro() {
    setIsLoading(true)
    try {
      const [pagarRes, receberRes] = await Promise.all([
        contaPagarService.listarContasPagar({ page: 1, limit: 200 }),
        contaReceberService.listarContasReceber({ page: 1, limit: 200 }),
      ])
      setContasPagar(pagarRes.data.data)
      setContasReceber(receberRes.data.data)
    } catch {
      if (import.meta.env.DEV) {
        toast.error('Nao foi possivel carregar os dados do financeiro.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadFinanceiro()
  }, [])

  const unifiedTransactions = useMemo(() => {
    const expenses = contasPagar.map((conta) => {
      const mapped = mapContaPagarToTransaction(conta)
      return {
        ...mapped,
        // Mantemos IDs de despesa positivos e IDs de receita negativos.
        // Isso evita colisao de id entre entidades diferentes no TransactionList.
        id: Math.abs(mapped.id),
      }
    })

    const incomes = contasReceber.map((conta) => {
      const mapped = mapContaReceberToTransaction(conta)
      return {
        ...mapped,
        id: -Math.abs(mapped.id),
      }
    })

    return [...expenses, ...incomes].sort((a, b) => {
      const aDate = parseDate(a.dataLancamento) ?? parseDate(a.dataVencimento) ?? new Date(0)
      const bDate = parseDate(b.dataLancamento) ?? parseDate(b.dataVencimento) ?? new Date(0)
      return bDate.getTime() - aDate.getTime()
    })
  }, [contasPagar, contasReceber])

  const filteredTransactions = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    return unifiedTransactions.filter((transaction) => {
      const status = normalizeStatus(transaction.status)
      const referenceDate = parseDate(transaction.dataVencimento) ?? parseDate(transaction.dataLancamento)

      const matchType = filters.type === 'ALL' ? true : transaction.type === filters.type
      const matchStatus = filters.status === 'ALL' ? true : status === filters.status
      const matchDate =
        !filters.dateFrom && !filters.dateTo
          ? true
          : isInRange(referenceDate, filters.dateFrom, filters.dateTo)
      const matchSearch =
        !search ||
        transaction.descricao.toLowerCase().includes(search) ||
        String(transaction.categoria ?? '').toLowerCase().includes(search)

      return matchType && matchStatus && matchDate && matchSearch
    })
  }, [filters, unifiedTransactions])

  const pagination = useMemo(() => {
    const total = filteredTransactions.length
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const page = Math.min(currentPage, totalPages)
    return {
      total,
      totalPages,
      page,
      start: (page - 1) * PAGE_SIZE,
      end: (page - 1) * PAGE_SIZE + PAGE_SIZE,
    }
  }, [currentPage, filteredTransactions.length])

  const paginatedTransactions = useMemo(
    () => filteredTransactions.slice(pagination.start, pagination.end),
    [filteredTransactions, pagination.end, pagination.start],
  )

  useEffect(() => {
    if (currentPage !== pagination.page) {
      setCurrentPage(pagination.page)
    }
  }, [currentPage, pagination.page])

  async function handleSubmitContaPagar(
    payload: CreateContaPagarRequest | UpdateContaPagarRequest,
  ) {
    setIsSubmittingPagar(true)
    try {
      if (selectedContaPagar) {
        await contaPagarService.atualizarContaPagar(selectedContaPagar.id, payload as UpdateContaPagarRequest)
        if (import.meta.env.DEV) toast.success('Conta a pagar atualizada com sucesso.')
      } else {
        await contaPagarService.criarContaPagar(payload as CreateContaPagarRequest)
        if (import.meta.env.DEV) toast.success('Conta a pagar cadastrada com sucesso.')
      }
      setSelectedContaPagar(null)
      setIsContaPagarFormOpen(false)
      await loadFinanceiro()
    } catch {
      if (import.meta.env.DEV) toast.error('Erro ao salvar conta a pagar.')
    } finally {
      setIsSubmittingPagar(false)
    }
  }

  async function handleSubmitContaReceber(
    payload: CreateContaReceberRequest | UpdateContaReceberRequest,
  ) {
    setIsSubmittingReceber(true)
    try {
      if (selectedContaReceber) {
        await contaReceberService.atualizarContaReceber(
          selectedContaReceber.id,
          payload as UpdateContaReceberRequest,
        )
        if (import.meta.env.DEV) toast.success('Conta a receber atualizada com sucesso.')
      } else {
        await contaReceberService.criarContaReceber(payload as CreateContaReceberRequest)
        if (import.meta.env.DEV) toast.success('Conta a receber cadastrada com sucesso.')
      }
      setSelectedContaReceber(null)
      setIsContaReceberFormOpen(false)
      await loadFinanceiro()
    } catch {
      if (import.meta.env.DEV) toast.error('Erro ao salvar conta a receber.')
    } finally {
      setIsSubmittingReceber(false)
    }
  }

  async function handleEdit(transactionId: number) {
    const isIncome = transactionId < 0
    const realId = Math.abs(transactionId)

    try {
      if (isIncome) {
        const response = await contaReceberService.buscarContaReceberPorId(realId)
        setSelectedContaReceber(response.data)
        setSelectedContaPagar(null)
        setIsContaReceberFormOpen(true)
      } else {
        const response = await contaPagarService.buscarContaPagarPorId(realId)
        setSelectedContaPagar(response.data)
        setSelectedContaReceber(null)
        setIsContaPagarFormOpen(true)
      }
    } catch {
      if (import.meta.env.DEV) toast.error('Nao foi possivel carregar o registro para edicao.')
    }
  }

  async function handleDelete(transactionId: number) {
    const transaction = unifiedTransactions.find((item) => item.id === transactionId)
    if (!transaction) return

    const confirmed = window.confirm(
      `Deseja excluir "${transaction.descricao}" (${transaction.type === 'INCOME' ? 'Receita' : 'Despesa'})?`,
    )
    if (!confirmed) return

    const realId = Math.abs(transactionId)
    try {
      if (transaction.type === 'INCOME') {
        await contaReceberService.deletarContaReceber(realId)
      } else {
        await contaPagarService.deletarContaPagar(realId)
      }
      if (import.meta.env.DEV) toast.success('Registro excluido com sucesso.')
      await loadFinanceiro()
    } catch {
      if (import.meta.env.DEV) toast.error('Nao foi possivel excluir o registro.')
    }
  }

  return (
    <section className="scrollbar-hide flex h-full min-h-0 flex-1 flex-col gap-6 overflow-y-auto md:gap-8">
      <div className="shrink-0 space-y-6">
        <div className="flex flex-col gap-4 px-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
              Base Financeira
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Lista unificada de receitas e despesas, com filtros e edicao rapida.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                void loadFinanceiro()
              }}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-indigo-900 dark:hover:text-indigo-300"
              title="Sincronizar dados"
              aria-label="Sincronizar dados"
            >
              <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <Button
              type="button"
              onClick={() => {
                setSelectedContaReceber(null)
                setIsContaReceberFormOpen(true)
              }}
              startIcon={<ArrowUpCircle size={18} />}
              className="rounded-2xl px-5 py-3 text-sm font-bold shadow-xl shadow-emerald-200/40 dark:shadow-emerald-950/30"
            >
              Nova Receita
            </Button>
            <Button
              type="button"
              onClick={() => {
                setSelectedContaPagar(null)
                setIsContaPagarFormOpen(true)
              }}
              startIcon={<ArrowDownCircle size={18} />}
              className="rounded-2xl px-5 py-3 text-sm font-bold shadow-xl shadow-rose-200/40 dark:shadow-rose-950/30"
            >
              Nova Despesa
            </Button>
          </div>
        </div>

        <FinanceiroFilters
          value={filters}
          isLoading={isLoading}
          onChange={(next) => {
            setFilters(next)
            setCurrentPage(1)
          }}
          onSearch={() => {
            setCurrentPage(1)
          }}
          onClear={() => {
            setFilters({
              search: '',
              type: 'ALL',
              status: 'ALL',
              dateFrom: null,
              dateTo: null,
            })
            setCurrentPage(1)
          }}
        />

        <div className="inline-flex w-fit items-center px-1 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {pagination.total} {pagination.total === 1 ? 'Registro Encontrado' : 'Registros Encontrados'}
        </div>
      </div>

      <ContaPagarForm
        isOpen={isContaPagarFormOpen}
        selectedContaPagar={selectedContaPagar}
        isSubmitting={isSubmittingPagar}
        onSubmit={handleSubmitContaPagar}
        onClose={() => {
          setSelectedContaPagar(null)
          setIsContaPagarFormOpen(false)
        }}
      />

      <ContaReceberForm
        isOpen={isContaReceberFormOpen}
        selectedContaReceber={selectedContaReceber}
        isSubmitting={isSubmittingReceber}
        onSubmit={handleSubmitContaReceber}
        onClose={() => {
          setSelectedContaReceber(null)
          setIsContaReceberFormOpen(false)
        }}
      />

      <TransactionList
        transactions={paginatedTransactions}
        onEdit={(transaction) => {
          void handleEdit(transaction.id)
        }}
        onDelete={(id) => {
          void handleDelete(id)
        }}
      />

      <PaginationFooter
        total={pagination.total}
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        itemLabelSingular="registro"
        itemLabelPlural="registros"
        onPageChange={(page) => setCurrentPage(page)}
      />
    </section>
  )
}

