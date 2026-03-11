import { z } from 'zod';

export const createFeedbackFinalSchema = z.object({
  curso_id: z.coerce.number().int('ID do curso deve ser inteiro').positive('ID do curso inválido'),
  aluno_id: z.coerce.number().int('ID do aluno deve ser inteiro').positive('ID do aluno inválido').optional(),
  objetivo_atingido: z.string().min(3, 'Descreva melhor o que mudou ou o objetivo atingido'),
  resultado_esperado: z.string().optional(),
  avaliacao: z.coerce
    .number()
    .int('Avaliação deve ser um número inteiro')
    .min(1, 'Avaliação mínima é 1')
    .max(5, 'Avaliação máxima é 5'),
});

export const updateFeedbackFinalSchema = createFeedbackFinalSchema.partial({
  objetivo_atingido: true,
  resultado_esperado: true,
  avaliacao: true,
});

