import { z } from 'zod';

export const createInscricaoSchema = z.object({
  aluno_id: z.coerce.number().int("ID do aluno deve ser inteiro").positive("ID do aluno inválido"),
  curso_id: z.coerce.number().int("ID do curso deve ser inteiro").positive("ID do curso inválido"),
});

export const deleteInscricaoSchema = z.object({
  curso_id: z.coerce.number().int("ID do curso deve ser inteiro").positive("ID do curso inválido"),
});

