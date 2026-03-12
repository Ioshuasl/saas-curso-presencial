import { Router } from 'express';
import ContaPagarController from '../controllers/ContaPagarController.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createContaPagarSchema,
  updateContaPagarSchema,
} from '../schema/ContaPagarSchema.js';

const routes = new Router();

/**
 * @swagger
 * tags:
 *   name: Contas a Pagar
 *   description: Gestão de despesas e contas a pagar
 */

// Todas as rotas de financeiro são restritas a administradores
routes.use(authMiddleware, adminOnly);

/**
 * @swagger
 * /contas-pagar:
 *   get:
 *     summary: Listar contas a pagar com filtros e paginação
 *     tags: [Contas a Pagar]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de contas a pagar
 */
routes.get('/contas-pagar', ContaPagarController.index);
/**
 * @swagger
 * /contas-pagar/{id}:
 *   get:
 *     summary: Buscar conta a pagar por ID
 *     tags: [Contas a Pagar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conta encontrada
 */
routes.get('/contas-pagar/:id', ContaPagarController.show);
/**
 * @swagger
 * /contas-pagar:
 *   post:
 *     summary: Criar conta a pagar
 *     tags: [Contas a Pagar]
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
 *         description: Conta criada
 */
routes.post('/contas-pagar', validate(createContaPagarSchema), ContaPagarController.store);
/**
 * @swagger
 * /contas-pagar/{id}:
 *   put:
 *     summary: Atualizar conta a pagar
 *     tags: [Contas a Pagar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Conta atualizada
 */
routes.put('/contas-pagar/:id', validate(updateContaPagarSchema), ContaPagarController.update);
/**
 * @swagger
 * /contas-pagar/{id}:
 *   delete:
 *     summary: Remover conta a pagar
 *     tags: [Contas a Pagar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Conta excluída
 */
routes.delete('/contas-pagar/:id', ContaPagarController.delete);

export default routes;

