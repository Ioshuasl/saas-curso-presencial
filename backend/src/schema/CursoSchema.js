import { z } from 'zod';
import {
  tenantContextFields,
  refineHasTenantContext,
} from './TenantContextSchema.js';

const sessaoSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  data: z.string().min(1, 'Data da sessão é obrigatória'),
  horario_inicio: z.string().min(1, 'Horário de início é obrigatório'),
  horario_fim: z.string().min(1, 'Horário de fim é obrigatório'),
});

const parseSessoes = (value) => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const cursoBase = {
  url_imagem: z.string().nullable().optional(), // path ou URL; em create pode vir do upload (imagem)
  nome: z.string().min(3, "Nome do curso deve ter ao menos 3 caracteres"),
  ministrante: z.string().min(3, "Nome do ministrante muito curto").optional(),
  descricao: z.string().optional(),
  conteudo: z.string().optional(),
  valor: z.coerce.number().nonnegative("Valor não pode ser negativo"),
  vagas: z.coerce.number().int("Vagas deve ser um número inteiro").positive("Vagas deve ser maior que zero"),
  local: z.string().min(3, "Local deve ter ao menos 3 caracteres"),
  status: z.preprocess(
    (v) => (v === true || v === 'true' || v === '1' ? true : v === false || v === 'false' || v === '0' ? false : v),
    z.boolean().optional()
  ),
  sessoes: z.preprocess(parseSessoes, z.array(sessaoSchema).optional()),
};

export const createCursoSchema = z
  .object({
    ...cursoBase,
    ...tenantContextFields,
  })
  .superRefine(refineHasTenantContext);

export const updateCursoSchema = z
  .object({
    ...cursoBase,
    ...tenantContextFields,
  })
  .partial();

