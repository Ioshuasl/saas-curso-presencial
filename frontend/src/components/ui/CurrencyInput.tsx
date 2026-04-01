import { MaskedInput } from './MaskedInput'
import { cn } from '../../utils/cn'

/** Valor numérico a partir do unmasked do IMask (moeda BRL). Vazio => `null`. */
export function parseCurrencyUnmasked(unmasked: string): number | null {
  const s = String(unmasked ?? '').trim()
  if (!s) return null
  const normalized = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s
  const n = parseFloat(normalized)
  return Number.isFinite(n) ? n : null
}

const currencyInputClassName =
  '[&_input]:min-h-11 [&_input]:text-base sm:[&_input]:min-h-10 sm:[&_input]:text-sm md:[&_input]:rounded-2xl md:[&_input]:border-slate-100 md:[&_input]:bg-slate-50 md:[&_input]:py-3.5 md:[&_input]:font-semibold dark:md:[&_input]:border-slate-700 dark:md:[&_input]:bg-slate-800/60'

export type CurrencyInputProps = {
  label: string
  value: number | null
  onChange: (value: number | null) => void
  className?: string
  placeholder?: string
  disabled?: boolean
  helperText?: string
  id?: string
}

/**
 * Moeda BRL (R$ X.XXX,XX) com IMask; campo vazio até o usuário digitar.
 * Mesmo padrão visual do formulário de curso (desktop e mobile).
 */
export function CurrencyInput({
  label,
  value,
  onChange,
  className,
  placeholder = 'R$ 0,00',
  disabled,
  helperText,
  id,
}: CurrencyInputProps) {
  return (
    <MaskedInput
      id={id}
      label={label}
      maskType="currency"
      value={value}
      placeholder={placeholder}
      inputMode="decimal"
      autoComplete="off"
      enterKeyHint="next"
      helperText={helperText}
      disabled={disabled}
      onAccept={(_masked, unmasked) => {
        onChange(parseCurrencyUnmasked(unmasked))
      }}
      className={cn(currencyInputClassName, className)}
    />
  )
}
