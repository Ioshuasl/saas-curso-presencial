import { Tenant } from '../models/index.js';

/**
 * Resolve o id do tenant a partir de `tenant_id` ou `tenant_slug` no body/query.
 */
export async function resolveTenantId({ tenant_id, tenant_slug }) {
  if (tenant_id != null && tenant_id !== '') {
    const id = Number(tenant_id);
    if (!Number.isInteger(id) || id < 1) {
      throw new Error('tenant_id inválido');
    }
    const row = await Tenant.findByPk(id);
    if (!row || !row.ativo) {
      throw new Error('Tenant não encontrado ou inativo');
    }
    return id;
  }
  const slug =
    tenant_slug != null && typeof tenant_slug === 'string'
      ? tenant_slug.trim()
      : '';
  if (slug.length > 0) {
    const row = await Tenant.findOne({ where: { slug, ativo: true } });
    if (!row) {
      throw new Error('Tenant não encontrado para o slug informado');
    }
    return row.id;
  }
  throw new Error('Informe tenant_id ou tenant_slug');
}

export function omitTenantContext(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const { tenant_id, tenant_slug, ...rest } = obj;
  return rest;
}
