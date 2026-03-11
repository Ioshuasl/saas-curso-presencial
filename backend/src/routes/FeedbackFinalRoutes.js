import { Router } from 'express';
import FeedbackFinalController from '../controllers/FeedbackFinalController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createFeedbackFinalSchema } from '../schema/FeedbackFinalSchema.js';

const routes = new Router();

routes.use(authMiddleware); // Todas as rotas exigem usuário autenticado

// Aluno (ou admin em nome do aluno) responde ou atualiza o feedback final
routes.post(
  '/feedbacks-finais',
  validate(createFeedbackFinalSchema),
  FeedbackFinalController.store,
);

// Aluno logado busca o próprio feedback final para um curso específico
routes.get('/feedbacks-finais/:curso_id', FeedbackFinalController.show);

export default routes;

