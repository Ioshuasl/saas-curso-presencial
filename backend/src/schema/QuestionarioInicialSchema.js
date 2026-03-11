import { z } from 'zod';

export const createQuestionarioInicialSchema = z.object({
  curso_id: z.coerce.number().int('ID do curso deve ser inteiro').positive('ID do curso inválido'),
  aluno_id: z.coerce.number().int('ID do aluno deve ser inteiro').positive('ID do aluno inválido').optional(),
  maior_dor_inicio: z.string().min(3, 'Descreva melhor a sua maior dor no início'),
  principal_expectativa: z.string().min(3, 'Descreva melhor a sua principal expectativa'),
});

export const updateQuestionarioInicialSchema = createQuestionarioInicialSchema.partial({
  maior_dor_inicio: true,
  principal_expectativa: true,
});

