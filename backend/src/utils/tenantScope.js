/**
 * Helpers para garantir que consultas e writes fiquem sempre no tenant correto.
 */

export function requireTenantId(tenantId) {
  const id = Number(tenantId);
  if (!Number.isInteger(id) || id < 1) {
    throw new Error('tenantId é obrigatório para esta operação');
  }
  return id;
}

/**
 * Mescla `tenant_id` em um objeto `where` do Sequelize.
 * @param {number|string} tenantId
 * @param {object} [where] - condições adicionais (pode ser {})
 */
export function mergeTenantWhere(tenantId, where = {}) {
  const id = requireTenantId(tenantId);
  return { ...where, tenant_id: id };
}

/**
 * Monta `where` só com tenant (útil quando não há outros filtros).
 */
export function whereTenantOnly(tenantId) {
  return mergeTenantWhere(tenantId, {});
}
