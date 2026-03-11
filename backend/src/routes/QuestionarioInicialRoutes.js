import { Router } from 'express';
import QuestionarioInicialController from '../controllers/QuestionarioInicialController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createQuestionarioInicialSchema } from '../schema/QuestionarioInicialSchema.js';

const routes = new Router();

routes.use(authMiddleware); // Todas as rotas exigem usuário autenticado

// Aluno (ou admin em nome do aluno) responde ou atualiza o questionário inicial
routes.post(
  '/questionarios-iniciais',
  validate(createQuestionarioInicialSchema),
  QuestionarioInicialController.store,
);

// Aluno logado busca o próprio questionário inicial para um curso específico
routes.get(
  '/questionarios-iniciais/:curso_id',
  QuestionarioInicialController.show,
);

export default routes;

