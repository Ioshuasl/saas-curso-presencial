import { Router } from 'express';
import ConfigController from '../controllers/ConfigController.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { updateConfigSchema } from '../schema/ConfigSchema.js';

const routes = new Router();

/**
 * @swagger
 * tags:
 *   name: Configurações
 *   description: Configurações por tenant (JSONB)
 */

// Mantido com auth + adminOnly como as demais rotas de tenancy do projeto.
routes.use('/tenants', authMiddleware, adminOnly);

/**
 * @swagger
 * /tenants/{tenantId}/config:
 *   get:
 *     summary: Buscar configuração do tenant
 *     tags: [Configurações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Configuração encontrada
 */
routes.get('/tenants/:tenantId/config', ConfigController.show);

/**
 * @swagger
 * /tenants/{tenantId}/config:
 *   patch:
 *     summary: Atualizar configuração do tenant (merge em settings)
 *     tags: [Configurações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Configuração atualizada
 */
routes.patch(
  '/tenants/:tenantId/config',
  validate(updateConfigSchema),
  ConfigController.update
);

export default routes;
