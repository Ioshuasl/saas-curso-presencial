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

/**
 * Leitura: qualquer usuário autenticado do próprio tenant (ex.: telefone/WhatsApp no catálogo).
 * Escrita: apenas admin (PATCH abaixo).
 */
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
routes.get('/tenants/:tenantId/config', authMiddleware, ConfigController.show);

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
  authMiddleware,
  adminOnly,
  validate(updateConfigSchema),
  ConfigController.update
);

export default routes;
