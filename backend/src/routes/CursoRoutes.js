import { Router } from 'express';
import CursoController from '../controllers/CursoController.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createCursoSchema, updateCursoSchema } from '../schema/CursoSchema.js';

const routes = new Router();

// Rotas públicas (Alunos precisam ver os cursos disponíveis)
routes.get('/cursos', CursoController.index);
routes.get('/cursos/:id', CursoController.show);
routes.get('/cursos/:id/vagas', CursoController.checkVagas);
routes.get('/cursos/por-data', CursoController.byDate);

// Rotas protegidas (Apenas Admins gerenciam cursos)
routes.post('/cursos', authMiddleware, adminOnly, validate(createCursoSchema), CursoController.store);
routes.put('/cursos/:id', authMiddleware, adminOnly, validate(updateCursoSchema), CursoController.update);
routes.delete('/cursos/:id', authMiddleware, adminOnly, CursoController.delete);
routes.get('/cursos/:id/alunos', authMiddleware, adminOnly, CursoController.listAlunos);

export default routes;