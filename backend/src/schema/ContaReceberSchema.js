import { z } from 'zod';
import {
  tenantContextFields,
  refineHasTenantContext,
} from './TenantContextSchema.js';

const parcelaSchema = z.object({
  numero_parcela: z.coerce.number().int('Número da parcela deve ser inteiro').positive('Número da parcela inválido'),
  valor: z.coerce.number().positive('Valor da parcela deve ser maior que zero'),
  data_vencimento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de vencimento deve estar no formato YYYY-MM-DD'),
  pago: z.boolean().optional(),
  data_pagamento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de pagamento deve estar no formato YYYY-MM-DD')
    .optional(),
});

const contaReceberBase = {
  aluno_id: z.coerce.number().int('ID do aluno deve ser inteiro').positive('ID do aluno inválido'),
  curso_id: z.coerce.number().int('ID do curso deve ser inteiro').positive('ID do curso inválido'),
  forma_pagamento: z.enum(['PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO']),
  valor_total: z.coerce.number().positive('Valor total deve ser maior que zero'),
  descricao: z.string().min(3, 'Descrição muito curta').optional(),
  observacao: z.string().optional(),
  parcelas: z.array(parcelaSchema).min(1, 'Informe ao menos uma parcela'),
};

export const createContaReceberSchema = z
  .object({
    ...contaReceberBase,
    ...tenantContextFields,
  })
  .superRefine(refineHasTenantContext);

export const updateContaReceberSchema = z
  .object({
    ...contaReceberBase,
    ...tenantContextFields,
  })
  .partial();

export const marcarParcelaPagaSchema = z.object({
  data_pagamento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de pagamento deve estar no formato YYYY-MM-DD')
    .optional(),
});

