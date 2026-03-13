import { z } from 'zod';

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
};

export const createCursoSchema = z.object({
  ...cursoBase,
});

export const updateCursoSchema = z.object({
  ...cursoBase,
}).partial();

