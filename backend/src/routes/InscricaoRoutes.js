import { Router } from 'express';
import InscricaoController from '../controllers/InscricaoController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createInscricaoSchema, deleteInscricaoSchema } from '../schema/InscricaoSchema.js';

const routes = new Router();

routes.use(authMiddleware); // Protege todas as rotas abaixo

// O aluno logado vê seus cursos
routes.get('/minhas-inscricoes', InscricaoController.myEnrollments);

// O aluno se inscreve ou o Admin inscreve alguém
routes.post('/inscricoes', validate(createInscricaoSchema), InscricaoController.store);

// O aluno cancela ou o Admin remove
routes.delete('/inscricoes/:curso_id', validate(deleteInscricaoSchema), InscricaoController.delete);

export default routes;