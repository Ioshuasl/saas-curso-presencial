import { z } from 'zod';

const trimEmpty = (v) => {
  if (v === '' || v === null || v === undefined) return undefined;
  return typeof v === 'string' ? v.trim() : v;
};

/** ID numérico do tenant (quando o cliente já conhece o id). */
export const tenantIdZ = z.coerce
  .number()
  .int('tenant_id deve ser um número inteiro')
  .positive('tenant_id deve ser maior que zero');

/**
 * Slug do tenant (mesmo valor de `tenants.slug`), alinhado ao uso de slug na URL em dev.
 */
export const tenantSlugField = z.preprocess(
  trimEmpty,
  z
    .string()
    .min(1, 'tenant_slug não pode ser vazio')
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, {
      message: 'tenant_slug deve conter apenas letras, números e hífens',
    })
    .optional()
);

/**
 * Campos opcionais isolados; combine com `refineHasTenantContext` quando o tenant for obrigatório.
 */
export const tenantContextFields = {
  tenant_id: tenantIdZ.optional(),
  tenant_slug: tenantSlugField.optional(),
};

export function refineHasTenantContext(data, ctx) {
  const id = data.tenant_id;
  const hasId =
    id != null &&
    id !== '' &&
    Number.isFinite(Number(id)) &&
    Number(id) > 0;
  const slug = data.tenant_slug;
  const hasSlug = typeof slug === 'string' && slug.trim().length > 0;
  if (!hasId && !hasSlug) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'Informe tenant_id ou tenant_slug (ex.: slug usado na URL do ambiente local).',
      path: ['tenant_slug'],
    });
  }
}
