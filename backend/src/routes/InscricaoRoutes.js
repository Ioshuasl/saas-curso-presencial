import { Router } from 'express';
import InscricaoController from '../controllers/InscricaoController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createInscricaoSchema,
  deleteInscricaoSchema,
  confirmarPresencaSchema,
} from '../schema/InscricaoSchema.js';

const routes = new Router();

/**
 * @swagger
 * tags:
 *   name: Inscrições
 *   description: Gestão de inscrições dos alunos nos cursos
 */

routes.use(authMiddleware); // Protege todas as rotas abaixo

// O aluno logado vê seus cursos
/**
 * @swagger
 * /minhas-inscricoes:
 *   get:
 *     summary: Listar cursos em que o aluno autenticado está inscrito
 *     tags: [Inscrições]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cursos do aluno
 */
routes.get('/minhas-inscricoes', InscricaoController.myEnrollments);

// O aluno se inscreve ou o Admin inscreve alguém
/**
 * @swagger
 * /inscricoes:
 *   post:
 *     summary: Criar inscrição em um curso
 *     tags: [Inscrições]
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
 *         description: Inscrição criada
 */
routes.post('/inscricoes', validate(createInscricaoSchema), InscricaoController.store);

// O aluno confirma presença em um curso em que está inscrito
/**
 * @swagger
 * /inscricoes/{curso_id}/confirmar-presenca:
 *   post:
 *     summary: Confirmar presença do aluno em um curso
 *     tags: [Inscrições]
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
 *         description: Presença confirmada
 */
routes.post(
  '/inscricoes/:curso_id/confirmar-presenca',
  validate(confirmarPresencaSchema),
  InscricaoController.confirmarPresenca,
);

// O aluno cancela ou o Admin remove
/**
 * @swagger
 * /inscricoes/{curso_id}:
 *   delete:
 *     summary: Cancelar inscrição ou remover aluno de um curso
 *     tags: [Inscrições]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: curso_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Inscrição removida
 */
routes.delete('/inscricoes/:curso_id', validate(deleteInscricaoSchema), InscricaoController.delete);

export default routes;