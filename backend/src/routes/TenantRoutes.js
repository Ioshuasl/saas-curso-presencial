import { Router } from 'express';
import TenantController from '../controllers/TenantController.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createTenantSchema,
  updateTenantSchema,
} from '../schema/TenantSchema.js';

const routes = new Router();

/**
 * @swagger
 * tags:
 *   name: Tenants
 *   description: Gestão de tenants (clientes SaaS)
 */

// Aplica auth somente para rotas de tenants (evita bloquear /login, /me etc.).
routes.use('/tenants', authMiddleware, adminOnly);

routes.post('/tenants', validate(createTenantSchema), TenantController.store);
routes.get('/tenants', TenantController.index);
routes.get('/tenants/:id', TenantController.show);
routes.put('/tenants/:id', validate(updateTenantSchema), TenantController.update);
routes.delete('/tenants/:id', TenantController.delete);

export default routes;
