type ResolveTenantInput = {
  href?: string
  hostname?: string
  pathname?: string
  search?: string
}

function isLocalHost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1'
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
    const hostParts = hostname.split('.')
    if (hostParts.length >= 3) {
      const subdomain = hostParts[0]?.trim()
      if (subdomain) return subdomain
    }
  }

  return null
}

export function resolveTenantSlugFromBrowser(): string | null {
  return resolveTenantSlug()
}

