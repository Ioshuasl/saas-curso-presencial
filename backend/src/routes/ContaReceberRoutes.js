import { Router } from 'express';
import ContaReceberController from '../controllers/ContaReceberController.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createContaReceberSchema,
  updateContaReceberSchema,
  marcarParcelaPagaSchema,
} from '../schema/ContaReceberSchema.js';

const routes = new Router();

function preventTenantOverride(req, res, next) {
  const requestedTenantId = req.query?.tenant_id ?? req.body?.tenant_id;
  const requestedTenantSlug = req.query?.tenant_slug ?? req.body?.tenant_slug;

  if (
    (requestedTenantId != null && String(requestedTenantId).trim() !== '') ||
    (requestedTenantSlug != null && String(requestedTenantSlug).trim() !== '')
  ) {
    return res.status(403).json({
      error:
        'Nao e permitido informar tenant_id/tenant_slug nesta rota. O tenant vem do token autenticado.',
    });
  }

  return next();
}

/**
 * @swagger
 * tags:
 *   name: Contas a Receber
 *   description: Gestão de receitas e contas a receber com parcelas
 */

// Todas as rotas de financeiro são restritas a administradores
routes.use(authMiddleware, adminOnly);
routes.use(preventTenantOverride);

/**
 * @swagger
 * /contas-receber:
 *   get:
 *     summary: Listar contas a receber com filtros e paginação
 *     tags: [Contas a Receber]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de contas a receber
 */
routes.get('/contas-receber', ContaReceberController.index);
/**
 * @swagger
 * /contas-receber/{id}:
 *   get:
 *     summary: Buscar conta a receber por ID (com parcelas)
 *     tags: [Contas a Receber]
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
routes.get('/contas-receber/:id', ContaReceberController.show);
/**
 * @swagger
 * /contas-receber:
 *   post:
 *     summary: Criar conta a receber com parcelas
 *     tags: [Contas a Receber]
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
routes.post('/contas-receber', validate(createContaReceberSchema), ContaReceberController.store);
/**
 * @swagger
 * /contas-receber/{id}:
 *   put:
 *     summary: Atualizar conta a receber e suas parcelas
 *     tags: [Contas a Receber]
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
routes.put('/contas-receber/:id', validate(updateContaReceberSchema), ContaReceberController.update);
/**
 * @swagger
 * /contas-receber/{id}:
 *   delete:
 *     summary: Excluir conta a receber e suas parcelas
 *     tags: [Contas a Receber]
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
routes.delete('/contas-receber/:id', ContaReceberController.delete);

// Marcar uma parcela específica como paga
/**
 * @swagger
 * /contas-receber/{id}/parcelas/{parcela_id}/pagar:
 *   post:
 *     summary: Marcar parcela de conta a receber como paga
 *     tags: [Contas a Receber]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: parcela_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Parcela marcada como paga
 */
routes.post(
  '/contas-receber/:id/parcelas/:parcela_id/pagar',
  validate(marcarParcelaPagaSchema),
  ContaReceberController.marcarParcelaComoPaga,
);

export default routes;

