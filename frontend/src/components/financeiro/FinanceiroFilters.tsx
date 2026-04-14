import { ChevronDown, RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../ui/Button'
import { DatePicker } from '../ui/DatePicker'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

export type FinanceiroFilterValue = {
  search: string
  type: 'ALL' | 'INCOME' | 'EXPENSE'
  status: 'ALL' | 'PAGO' | 'PARCIAL' | 'PENDENTE' | 'ATRASADO'
  dateFrom: Date | null
  dateTo: Date | null
}

type FinanceiroFiltersProps = {
  value: FinanceiroFilterValue
  isLoading?: boolean
  onChange: (next: FinanceiroFilterValue) => void
  onSearch: () => void
  onClear: () => void
}

export function FinanceiroFilters({
  value,
  isLoading = false,
  onChange,
  onSearch,
  onClear,
}: FinanceiroFiltersProps) {
  /** Recolhido por padrao em telas < xl (notebooks) para liberar altura para a lista. */
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  return (
    <form
      className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 dark:border-slate-800 dark:bg-slate-900"
      onSubmit={(event) => {
        event.preventDefault()
        onSearch()
      }}
    >
      <div className="mb-3 flex items-center justify-between xl:hidden">
        <button
          type="button"
          onClick={() => setIsFiltersOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <SlidersHorizontal size={14} />
          Filtros
          <ChevronDown
            size={14}
            className={`transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          startIcon={<RotateCcw size={12} />}
          onClick={onClear}
          disabled={isLoading}
          className="rounded-xl"
        >
          Limpar
        </Button>
      </div>

      <div
        className={`space-y-3 ${isFiltersOpen ? 'block' : 'hidden'} xl:block`}
      >
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Input
            label="Busca"
            value={value.search}
            onChange={(event) => onChange({ ...value, search: event.target.value })}
            placeholder="Descrição ou categoria"
            startIcon={<Search size={16} />}
          />

          <Select
            label="Tipo"
            value={value.type}
            onChange={(selected) =>
              onChange({
                ...value,
                type: String(selected ?? 'ALL') as FinanceiroFilterValue['type'],
              })
            }
            options={[
              { label: 'Todos', value: 'ALL' },
              { label: 'Receitas', value: 'INCOME' },
              { label: 'Despesas', value: 'EXPENSE' },
            ]}
          />

          <Select
            label="Status"
            value={value.status}
            onChange={(selected) =>
              onChange({
                ...value,
                status: String(selected ?? 'ALL') as FinanceiroFilterValue['status'],
              })
            }
            options={[
              { label: 'Todos', value: 'ALL' },
              { label: 'Pago', value: 'PAGO' },
              { label: 'Parcial', value: 'PARCIAL' },
              { label: 'Pendente', value: 'PENDENTE' },
              { label: 'Atrasado', value: 'ATRASADO' },
            ]}
          />

          <DatePicker
            label="Data inicial"
            value={value.dateFrom}
            onChange={(date) => onChange({ ...value, dateFrom: date })}
            size="md"
          />

          <DatePicker
            label="Data final"
            value={value.dateTo}
            onChange={(date) => onChange({ ...value, dateTo: date })}
            size="md"
          />
        </div>

        <div className="hidden items-center justify-end gap-2 md:flex">
          <Button
            type="button"
            variant="outline"
            onClick={onClear}
            startIcon={<RotateCcw size={14} />}
            disabled={isLoading}
            className="rounded-2xl"
          >
            Limpar
          </Button>
          <Button type="submit" disabled={isLoading} className="rounded-2xl px-5">
            Buscar
          </Button>
        </div>

        <div className="flex items-center justify-end gap-2 md:hidden">
          <Button type="submit" disabled={isLoading} className="rounded-xl px-4">
            Aplicar
          </Button>
        </div>
      </div>
    </form>
  )
}

