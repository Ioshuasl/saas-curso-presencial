import { z } from 'zod';

const contaPagarBase = {
  descricao: z.string().min(3, 'Descrição muito curta'),
  categoria: z.string().min(3, 'Categoria muito curta'),
  valor: z.coerce.number().positive('Valor deve ser maior que zero'),
  data_vencimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de vencimento deve estar no formato YYYY-MM-DD'),
  data_pagamento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de pagamento deve estar no formato YYYY-MM-DD')
    .optional(),
  observacao: z.string().optional(),
  status: z.enum(['PENDENTE', 'PAGO', 'ATRASADO']).optional(),
  curso_id: z.coerce.number().int('ID do curso deve ser inteiro').positive('ID do curso inválido').optional(),
};

export const createContaPagarSchema = z.object({
  ...contaPagarBase,
});

export const updateContaPagarSchema = z.object({
  ...contaPagarBase,
}).partial();

