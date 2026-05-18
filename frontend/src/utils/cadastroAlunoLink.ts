export type BuildAlunoCadastroUrlInput = {
  tenantSlug: string
  cursoId?: number
  origin?: string
}

/**
 * Monta a URL pública de auto-cadastro do aluno.
 * - Sem `cursoId`: cadastro no tenant apenas.
 * - Com `cursoId`: cadastro + inscrição no curso.
 */
export function buildAlunoCadastroUrl({
  tenantSlug,
  cursoId,
  origin,
}: BuildAlunoCadastroUrlInput): string {
  const slug = tenantSlug.trim()
  if (!slug) {
    throw new Error('tenant_slug é obrigatório para gerar o link de cadastro.')
  }

  const base =
    origin?.trim() ||
    (typeof window !== 'undefined' ? window.location.origin : '')

  if (!base) {
    throw new Error('Não foi possível determinar a origem do link.')
  }

  const url = new URL('/aluno-cadastro', base)
  url.searchParams.set('tenant_slug', slug)

  if (cursoId != null) {
    const id = Number(cursoId)
    if (!Number.isInteger(id) || id < 1) {
      throw new Error('curso_id inválido para gerar o link de cadastro.')
    }
    url.searchParams.set('curso_id', String(id))
  }

  return url.toString()
}

async function writeTextToClipboard(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  if (typeof document === 'undefined') {
    throw new Error('Clipboard não disponível neste ambiente.')
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)

  if (!copied) {
    throw new Error('Não foi possível copiar o link para a área de transferência.')
  }
}

/** Gera o link e copia para a área de transferência. Retorna a URL copiada. */
export async function copyAlunoCadastroLink(
  input: BuildAlunoCadastroUrlInput,
): Promise<string> {
  const url = buildAlunoCadastroUrl(input)
  await writeTextToClipboard(url)
  return url
}
