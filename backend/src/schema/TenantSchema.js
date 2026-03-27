import { z } from 'zod';

const boolFromForm = z.preprocess(
  (v) =>
    v === true || v === 'true' || v === '1'
      ? true
      : v === false || v === 'false' || v === '0'
        ? false
        : v,
  z.boolean()
);

const tenantBase = {
  nome: z.string().min(2, 'Nome do tenant deve ter ao menos 2 caracteres').max(255),
  slug: z.preprocess(
    (v) => {
      if (v === '' || v === null || v === undefined) return undefined;
      return typeof v === 'string' ? v.trim() : v;
    },
    z
      .string()
      .min(1, 'Slug não pode ser vazio')
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, {
        message: 'Slug deve conter apenas letras, números e hífens',
      })
      .optional()
  ),
  ativo: boolFromForm.optional(),
};

export const createTenantSchema = z.object({
  ...tenantBase,
});

export const updateTenantSchema = z.object({
  ...tenantBase,
}).partial();
