import { Button } from './Button'
import { cn } from '../../utils'

type PaginationFooterProps = {
  total: number
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemLabelSingular?: string
  itemLabelPlural?: string
  className?: string
}

export function PaginationFooter({
  total,
  currentPage,
  totalPages,
  onPageChange,
  itemLabelSingular = 'registro',
  itemLabelPlural = 'registros',
  className,
}: PaginationFooterProps) {
  const safeTotalPages = Math.max(1, totalPages || 1)
  const safeCurrentPage = Math.min(Math.max(1, currentPage || 1), safeTotalPages)

  return (
    <div
      className={cn(
        'flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400',
        className,
      )}
    >
      <span>
        Total: <strong>{total}</strong> {total === 1 ? itemLabelSingular : itemLabelPlural}
      </span>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={safeCurrentPage <= 1}
          onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
        >
          Anterior
        </Button>

        <span>
          Pagina <strong>{safeCurrentPage}</strong> de <strong>{safeTotalPages}</strong>
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={safeCurrentPage >= safeTotalPages}
          onClick={() => onPageChange(Math.min(safeTotalPages, safeCurrentPage + 1))}
        >
          Proxima
        </Button>
      </div>
    </div>
  )
}
