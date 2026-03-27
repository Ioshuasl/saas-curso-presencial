type ResolveTenantNavigationInput = {
  isAuthenticated: boolean
  sessionTenantSlug?: string | null
  urlTenantSlug?: string | null
}

export type TenantNavigationAction = 'allow' | 'sync_url_to_session' | 'force_relogin_mismatch'

export function resolveTenantNavigationAction(
  input: ResolveTenantNavigationInput,
): TenantNavigationAction {
  if (!input.isAuthenticated || !input.sessionTenantSlug) {
    return 'allow'
  }

  if (input.urlTenantSlug && input.urlTenantSlug !== input.sessionTenantSlug) {
    return 'force_relogin_mismatch'
  }

  if (!input.urlTenantSlug) {
    return 'sync_url_to_session'
  }

  return 'allow'
}

