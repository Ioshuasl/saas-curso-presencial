import { z } from 'zod';
import {
  refineHasTenantContext,
  tenantContextFields,
} from './TenantContextSchema.js';

const cpfSchema = z
  .string()
  .transform((value) => value.replace(/\D/g, ''))
  .refine((value) => value.length === 11, {
    message: 'CPF deve ter 11 dígitos (apenas números)',
  });

const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Username deve ter no mínimo 3 caracteres')
  .max(60, 'Username deve ter no máximo 60 caracteres');

const usuarioBase = {
  username: usernameSchema,
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  cpf: cpfSchema.optional(),
  status: z.boolean().optional(),
};

export const loginSchema = z
  .object({
    identificador: z
      .string()
      .min(1, 'Informe o identificador (username, e-mail ou CPF)'),
    senha: z.string().min(1, 'Informe a senha'),
    ...tenantContextFields,
  })
  .superRefine(refineHasTenantContext);

/** Cadastro por admin autenticado: tenant vem do JWT (`req.tenantId`), não do body. */
export const adminCreateAuthenticatedSchema = z.object({
  ...usuarioBase,
  nome_completo: z.string().min(5, 'Nome muito curto'),
});

export const alunoCreateAuthenticatedSchema = z.object({
  ...usuarioBase,
  nome_completo: z.string().min(5, 'Nome muito curto'),
  telefone: z.string().optional(),
  cidade: z.string().optional(),
  profissao: z.string().optional(),
  biografia: z.string().max(500, 'Biografia muito longa').optional(),
  curso_id: z.coerce
    .number()
    .int('curso_id deve ser um número inteiro')
    .positive('curso_id deve ser maior que zero')
    .optional(),
});

export const updateAdminSchema = z.object({
  ...usuarioBase,
  nome_completo: z.string().min(5, "Nome muito curto").optional(),
  ...tenantContextFields,
}).partial();

export const updateAlunoSchema = z.object({
  ...usuarioBase,
  nome_completo: z.string().min(5, "Nome muito curto").optional(),
  telefone: z.string().optional(),
  cidade: z.string().optional(),
  profissao: z.string().optional(),
  biografia: z.string().max(500, "Biografia muito longa").optional(),
  curso_id: z.coerce.number().int("curso_id deve ser um número inteiro").positive("curso_id deve ser maior que zero").optional(),
  ...tenantContextFields,
}).partial();
