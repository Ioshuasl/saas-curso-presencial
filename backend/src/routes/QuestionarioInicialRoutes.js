import { Router } from 'express';
import QuestionarioInicialController from '../controllers/QuestionarioInicialController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createQuestionarioInicialSchema } from '../schema/QuestionarioInicialSchema.js';

const routes = new Router();

/**
 * @swagger
 * tags:
 *   name: Questionário Inicial
 *   description: Coleta das dores e expectativas dos alunos
 */

routes.use(authMiddleware); // Todas as rotas exigem usuário autenticado

// Aluno (ou admin em nome do aluno) responde ou atualiza o questionário inicial
/**
 * @swagger
 * /questionarios-iniciais:
 *   post:
 *     summary: Responder ou atualizar o questionário inicial de um curso
 *     tags: [Questionário Inicial]
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
 *         description: Questionário salvo
 */
routes.post(
  '/questionarios-iniciais',
  validate(createQuestionarioInicialSchema),
  QuestionarioInicialController.store,
);

// Aluno logado busca o próprio questionário inicial para um curso específico
/**
 * @swagger
 * /questionarios-iniciais/{curso_id}:
 *   get:
 *     summary: Buscar questionário inicial do aluno para um curso
 *     tags: [Questionário Inicial]
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
 *         description: Questionário encontrado
 */
routes.get(
  '/questionarios-iniciais/:curso_id',
  QuestionarioInicialController.show,
);

export default routes;

