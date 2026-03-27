/**
 * Regra de segurança:
 * Toda operação autenticada deve respeitar o tenant do token (`req.tenantId`),
 * inclusive para SAAS_ADMIN.
 */
export async function resolveTenantIdForAdminRequest(req) {
  if (req.tenantId == null || req.tenantId === '') {
    throw new Error('tenantId não disponível no contexto autenticado');
  }
  return req.tenantId;
}

