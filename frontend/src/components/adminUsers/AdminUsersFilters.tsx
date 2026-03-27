import { RotateCcw, Search } from 'lucide-react'

import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export type AdminUsersFilterValue = {
  nome: string
  username: string
  email: string
  status: 'all' | 'active' | 'inactive'
}

type AdminUsersFiltersProps = {
  value: AdminUsersFilterValue
  isLoading?: boolean
  onChange: (next: AdminUsersFilterValue) => void
  onSearch: () => void
  onClear: () => void
}

export function AdminUsersFilters({
  value,
  isLoading = false,
  onChange,
  onSearch,
  onClear,
}: AdminUsersFiltersProps) {
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        onSearch()
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Input
            placeholder="Buscar por nome, username ou e-mail..."
            value={value.nome}
            onChange={(event) => onChange({ ...value, nome: event.target.value })}
            startIcon={<Search size={18} />}
            className="rounded-2xl"
            size="lg"
          />
        </div>

        <div className="flex items-center gap-2">
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
      </div>
    </form>
  )
}
