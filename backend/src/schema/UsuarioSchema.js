import { z } from 'zod';

// Esquema base com campos comuns
const usuarioBase = {
  username: z.string().min(3, "Username deve ter no mínimo 3 caracteres").max(20),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  cpf: z.string().length(11, "CPF deve ter 11 dígitos (apenas números)").optional(),
};

export const adminSchema = z.object({
  ...usuarioBase,
  nome_completo: z.string().min(5, "Nome muito curto"),
});

export const alunoSchema = z.object({
  ...usuarioBase,
  nome_completo: z.string().min(5, "Nome muito curto"),
  telefone: z.string().optional(),
  cidade: z.string().optional(),
  profissao: z.string().optional(),
  biografia: z.string().max(500, "Biografia muito longa").optional(),
  curso_id: z.coerce.number().int("curso_id deve ser um número inteiro").positive("curso_id deve ser maior que zero").optional(),
});

// Schema para atualização (todos os campos tornam-se opcionais)
export const updateAdminSchema = adminSchema.partial();
export const updateAlunoSchema = alunoSchema.partial();