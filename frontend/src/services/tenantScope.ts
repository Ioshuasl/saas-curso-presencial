type WithTenantScope = {
  tenant_id?: unknown
  tenant_slug?: unknown
}

export function stripTenantScope<T extends object>(value: T): T {
  const next = { ...value } as WithTenantScope
  delete next.tenant_id
  delete next.tenant_slug
  return next as T
}

