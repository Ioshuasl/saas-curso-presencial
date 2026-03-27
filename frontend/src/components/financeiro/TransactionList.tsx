import { ArrowDownLeft, ArrowUpRight, ChevronRight, Clock, Edit2, Link as LinkIcon, MoreHorizontal, Trash2 } from 'lucide-react'

import type { ContaPagar, ContaReceber } from '../../types'
import { cn } from '../../utils'

export type FinanceTransaction = {
  id: number
  descricao: string
  categoria?: string | null
  valor: number
  dataVencimento?: string | null
  dataLancamento?: string | null
  status: string
  parcelasPagas?: number
  parcelasTotal?: number
  observacoes?: string | null
  type: 'INCOME' | 'EXPENSE'
  hasLink?: boolean
}

type TransactionListProps = {
  transactions: FinanceTransaction[]
  onEdit: (transaction: FinanceTransaction) => void
  onDelete: (id: number) => void
  onToggleStatus?: (id: number, nextStatus: string) => void
  className?: string
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDateLabel(value?: string | null) {
  if (!value) return 'Sem data'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
}

function formatDateShort(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR')
}

function isPaidStatus(status: string) {
  const normalized = status.toUpperCase()
  return normalized === 'PAGO' || normalized === 'PAID' || normalized === 'LIQUIDADO'
}

export function mapContaPagarToTransaction(conta: ContaPagar): FinanceTransaction {
  return {
    id: conta.id,
    descricao: conta.descricao,
    categoria: conta.categoria,
    valor: Number(conta.valor ?? 0),
    dataVencimento: conta.data_vencimento,
    dataLancamento: conta.createdAt ?? null,
    status: conta.status,
    observacoes: conta.observacao ?? null,
    type: 'EXPENSE',
  }
}

export function mapContaReceberToTransaction(conta: ContaReceber): FinanceTransaction {
  return {
    id: conta.id,
    descricao: conta.descricao ?? conta.observacao ?? 'Recebimento',
    categoria: conta.categoria ?? conta.forma_pagamento ?? null,
    valor: Number(conta.valor_total ?? 0),
    dataVencimento: conta.parcelas?.[0]?.data_vencimento ?? null,
    dataLancamento: conta.createdAt ?? null,
    status: conta.status ?? 'PENDENTE',
    parcelasPagas: conta.parcelas_pagas,
    parcelasTotal: conta.parcelas_total,
    observacoes: conta.observacao ?? null,
    type: 'INCOME',
    hasLink: Boolean(conta.parcelas?.length),
  }
}

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
  onToggleStatus,
  className,
}: TransactionListProps) {
  if (!transactions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-300 dark:bg-slate-800 dark:text-slate-500">
          <Clock size={32} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">
          Sem transacoes para este periodo
        </p>
      </div>
    )
  }

  return (
    <div className={cn('min-w-0 pr-1', className)}>
      <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {transactions.map((transaction) => {
          const isIncome = transaction.type === 'INCOME'
          const statusUpper = String(transaction.status ?? '').toUpperCase()
          const isPaid = isPaidStatus(statusUpper)
          const isPartial = statusUpper === 'PARCIAL'
          const paidLabel = isPaid ? 'Liquidado' : isPartial ? 'Parcial' : 'Pendente'

          return (
            <article
              key={transaction.id}
              role="button"
              tabIndex={0}
              onClick={() => onEdit(transaction)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onEdit(transaction)
                }
              }}
              className="group rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-100 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900/60"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={cn(
                      'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                      isIncome
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
                    )}
                  >
                    {isIncome ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                      {transaction.descricao}
                    </h4>
                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {transaction.categoria || 'Sem categoria'}
                    </p>
                    {isIncome && transaction.parcelasTotal ? (
                      <p className="mt-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                        {transaction.parcelasPagas ?? 0}/{transaction.parcelasTotal} parcelas
                      </p>
                    ) : null}
                  </div>
                </div>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider',
                    isPaid
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : isPartial
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                  )}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full', isPaid ? 'bg-emerald-500' : 'bg-amber-400')} />
                  {paidLabel}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                    Vence em {formatDateShort(transaction.dataVencimento)}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {formatDateLabel(transaction.dataLancamento)}
                  </p>
                </div>
                <p
                  className={cn(
                    'text-base font-bold tracking-tight',
                    isIncome ? 'text-slate-900 dark:text-slate-100' : 'text-rose-600 dark:text-rose-300',
                  )}
                >
                  {isIncome ? '' : '- '}
                  {formatCurrency(transaction.valor)}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-end gap-1.5">
                {onToggleStatus ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onToggleStatus(transaction.id, isPaid ? 'PENDENTE' : 'PAGO')
                    }}
                    className="mr-auto text-[9px] font-black uppercase tracking-tighter text-indigo-500 hover:underline dark:text-indigo-300"
                  >
                    Marcar como {isPaid ? 'Pendente' : 'Pago'}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onEdit(transaction)
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-500 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-300"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onDelete(transaction.id)
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-500 dark:text-slate-500 dark:hover:bg-rose-900/40 dark:hover:text-rose-300"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          )
        })}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/60">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Descricao
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Datas
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Valor
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Acoes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.map((transaction) => {
                const isIncome = transaction.type === 'INCOME'
                const statusUpper = String(transaction.status ?? '').toUpperCase()
                const isPaid = isPaidStatus(statusUpper)
                const isPartial = statusUpper === 'PARCIAL'
                const paidLabel = isPaid ? 'Liquidado' : isPartial ? 'Parcial' : 'Pendente'

                return (
                  <tr
                    key={transaction.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onEdit(transaction)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onEdit(transaction)
                      }
                    }}
                    className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3 align-top">
                      <div
                        className={cn(
                          'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-wider',
                          isIncome
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
                        )}
                      >
                        {isIncome ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                        {isIncome ? 'Entrada' : 'Saida'}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="max-w-[320px]">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                            {transaction.descricao}
                          </p>
                          {transaction.hasLink ? (
                            <LinkIcon size={12} className="text-slate-300 dark:text-slate-600" />
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          {transaction.categoria || 'Sem categoria'}
                        </p>
                        {isIncome && transaction.parcelasTotal ? (
                          <p className="mt-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                            {transaction.parcelasPagas ?? 0}/{transaction.parcelasTotal} parcelas
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {formatDateLabel(transaction.dataLancamento)}
                      </p>
                      <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                        Vence em {formatDateShort(transaction.dataVencimento)}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider',
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : isPartial
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                        )}
                      >
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            isPaid ? 'bg-emerald-500' : isPartial ? 'bg-amber-400' : 'bg-amber-400 animate-pulse',
                          )}
                        />
                        {paidLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right align-top">
                      <p
                        className={cn(
                          'text-sm font-bold tracking-tight',
                          isIncome ? 'text-slate-900 dark:text-slate-100' : 'text-rose-600 dark:text-rose-300',
                        )}
                      >
                        {isIncome ? '' : '- '}
                        {formatCurrency(transaction.valor)}
                      </p>
                      {onToggleStatus ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onToggleStatus(transaction.id, isPaid ? 'PENDENTE' : 'PAGO')
                          }}
                          className="mt-1 text-[9px] font-black uppercase tracking-tighter text-indigo-500 hover:underline dark:text-indigo-300"
                        >
                          Marcar como {isPaid ? 'Pendente' : 'Pago'}
                        </button>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right align-top">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onEdit(transaction)
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-500 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-300"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onDelete(transaction.id)
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-500 dark:text-slate-500 dark:hover:bg-rose-900/40 dark:hover:text-rose-300"
                        >
                          <Trash2 size={15} />
                        </button>
                        <ChevronRight size={14} className="ml-1 text-slate-300 dark:text-slate-700" />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between px-2 pt-2 opacity-70">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          Exibindo {transactions.length} registros
        </p>
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-300">
              Entrada
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-[9px] font-bold uppercase text-slate-500 dark:text-slate-300">
              Saida
            </span>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
