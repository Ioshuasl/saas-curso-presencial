type ResolveTenantInput = {
  href?: string
  hostname?: string
  pathname?: string
  search?: string
}

function isLocalHost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

function resolveTenantBySubdomain(hostname: string): string | null {
  const baseDomain = String(import.meta.env.VITE_TENANT_SUBDOMAIN_ROOT_DOMAIN ?? '').trim().toLowerCase()
  if (!baseDomain) return null

  const host = hostname.trim().toLowerCase()
  if (!host || host === baseDomain) return null
  if (!host.endsWith(`.${baseDomain}`)) return null

  const suffix = `.${baseDomain}`
  const subdomain = host.slice(0, -suffix.length).trim()

  // Aceita apenas um label de subdomínio para evitar ambiguidades.
  if (!subdomain || subdomain.includes('.')) return null

  return subdomain
}

export function resolveTenantSlug(input: ResolveTenantInput = {}): string | null {
  const href = input.href ?? (typeof window !== 'undefined' ? window.location.href : '')
  const url = href ? new URL(href) : null
  const search = input.search ?? url?.search ?? ''
  const pathname = input.pathname ?? url?.pathname ?? ''
  const hostname = input.hostname ?? url?.hostname ?? ''

  const params = new URLSearchParams(search)
  const byQuery = params.get('tenant_slug')?.trim()
  if (byQuery) return byQuery

  // Suporte opcional para rotas no formato /t/:tenantSlug
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length >= 2 && parts[0] === 't' && parts[1].trim()) {
    return parts[1].trim()
  }

  // Suporte para subdomínio (ex.: tenant1.app.com)
  if (hostname && !isLocalHost(hostname)) {
    const bySubdomain = resolveTenantBySubdomain(hostname)
    if (bySubdomain) return bySubdomain
  }

  return null
}

export function resolveTenantSlugFromBrowser(): string | null {
  return resolveTenantSlug()
}

