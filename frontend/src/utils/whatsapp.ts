/**
 * Converte telefone exibido (máscara BR) em dígitos para `https://wa.me/{digits}`.
 * Assume Brasil (55) quando houver 10–11 dígitos sem código do país.
 */
export function phoneToWhatsAppDigits(raw: string | undefined | null): string | null {
  const d = String(raw ?? '').replace(/\D/g, '')
  if (!d) return null
  if (d.length >= 12 && d.startsWith('55')) return d
  if (d.length >= 10 && d.length <= 11) return `55${d}`
  if (d.length >= 13) return d
  if (d.length >= 8) return d
  return null
}
