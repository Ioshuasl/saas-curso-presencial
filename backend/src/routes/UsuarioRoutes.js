import { Router } from 'express';
import UsuarioController from '../controllers/UsuarioController.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { adminSchema, alunoSchema, updateAdminSchema, updateAlunoSchema } from '../schema/UsuarioSchema.js';

const routes = new Router();

// --- Rotas Públicas ---
routes.post('/login', UsuarioController.login);
routes.post('/usuarios/admin', validate(adminSchema) , UsuarioController.storeAdmin); // Cadastro de Admin
routes.post('/usuarios/aluno', validate(alunoSchema), UsuarioController.storeAluno); // Cadastro de Aluno

// --- Rotas Protegidas (Precisa estar Logado) ---
routes.use(authMiddleware);

routes.get('/me', UsuarioController.me);
routes.post('/logout', UsuarioController.logout);

// --- Rotas Administrativas (Apenas ADMIN pode ver/editar outros) ---
routes.get('/usuarios/admins', adminOnly, UsuarioController.indexAdmin);
routes.get('/usuarios/alunos', adminOnly, UsuarioController.indexAluno);
routes.get('/usuarios/admin/:id', adminOnly, UsuarioController.showAdmin);
routes.get('/usuarios/aluno/:id', adminOnly, UsuarioController.showAluno);
routes.put('/usuarios/admin/:id', validate(updateAdminSchema), adminOnly, UsuarioController.updateAdmin);
routes.put('/usuarios/aluno/:id', validate(updateAlunoSchema), adminOnly, UsuarioController.updateAluno);
routes.delete('/usuarios/:id', adminOnly, UsuarioController.delete);

export default routes;