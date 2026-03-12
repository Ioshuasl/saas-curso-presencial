import { Router } from 'express';
import FeedbackFinalController from '../controllers/FeedbackFinalController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createFeedbackFinalSchema } from '../schema/FeedbackFinalSchema.js';

const routes = new Router();

/**
 * @swagger
 * tags:
 *   name: Feedback Final
 *   description: Avaliação final dos cursos pelos alunos
 */

routes.use(authMiddleware); // Todas as rotas exigem usuário autenticado

// Aluno (ou admin em nome do aluno) responde ou atualiza o feedback final
/**
 * @swagger
 * /feedbacks-finais:
 *   post:
 *     summary: Enviar ou atualizar feedback final de um curso
 *     tags: [Feedback Final]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Feedback salvo
 */
routes.post(
  '/feedbacks-finais',
  validate(createFeedbackFinalSchema),
  FeedbackFinalController.store,
);

// Aluno logado busca o próprio feedback final para um curso específico
/**
 * @swagger
 * /feedbacks-finais/{curso_id}:
 *   get:
 *     summary: Buscar feedback final do aluno para um curso
 *     tags: [Feedback Final]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: curso_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Feedback encontrado
 */
routes.get('/feedbacks-finais/:curso_id', FeedbackFinalController.show);

export default routes;

