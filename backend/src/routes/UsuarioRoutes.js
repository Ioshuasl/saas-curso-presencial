import { Router } from 'express';
import UsuarioController from '../controllers/UsuarioController.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  loginSchema,
  adminCreateAuthenticatedSchema,
  alunoCreateAuthenticatedSchema,
  updateAdminSchema,
  updateAlunoSchema,
} from '../schema/UsuarioSchema.js';

const routes = new Router();

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Gestão de usuários (admin e aluno)
 */

// --- Rotas Públicas ---
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Autenticar usuário (admin ou aluno)
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identificador:
 *                 type: string
 *                 description: username, email ou cpf
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Autenticado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
routes.post('/login', validate(loginSchema), UsuarioController.login);

// --- Rotas Protegidas (Precisa estar Logado) ---
routes.use(authMiddleware);

/**
 * @swagger
 * /me:
 *   get:
 *     summary: Obter dados do usuário autenticado
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 */
routes.get('/me', UsuarioController.me);
/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout do usuário (cliente deve descartar o token)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado
 */
routes.post('/logout', UsuarioController.logout);

// --- Rotas Administrativas (Apenas ADMIN pode ver/editar outros) ---
/**
 * @swagger
 * /usuarios/admins:
 *   get:
 *     summary: Listar administradores com filtros e paginação
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de admins
 */
routes.get('/usuarios/admins', adminOnly, UsuarioController.indexAdmin);
/**
 * @swagger
 * /usuarios/alunos:
 *   get:
 *     summary: Listar alunos com filtros e paginação
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de alunos
 */
routes.get('/usuarios/alunos', adminOnly, UsuarioController.indexAluno);
/**
 * @swagger
 * /usuarios/admin:
 *   post:
 *     summary: Cadastrar um novo administrador (tenant do token)
 *     tags: [Usuários]
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
 *         description: Admin criado
 */
routes.post(
  '/usuarios/admin',
  adminOnly,
  validate(adminCreateAuthenticatedSchema),
  UsuarioController.storeAdmin,
);
/**
 * @swagger
 * /usuarios/aluno:
 *   post:
 *     summary: Cadastrar um novo aluno (tenant do token; opcional curso_id)
 *     tags: [Usuários]
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
 *         description: Aluno criado
 */
routes.post(
  '/usuarios/aluno',
  adminOnly,
  validate(alunoCreateAuthenticatedSchema),
  UsuarioController.storeAluno,
);
/**
 * @swagger
 * /usuarios/admin/{id}:
 *   get:
 *     summary: Buscar administrador por ID
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Admin encontrado
 */
routes.get('/usuarios/admin/:id', adminOnly, UsuarioController.showAdmin);
/**
 * @swagger
 * /usuarios/aluno/{id}:
 *   get:
 *     summary: Buscar aluno por ID
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Aluno encontrado
 */
routes.get('/usuarios/aluno/:id', adminOnly, UsuarioController.showAluno);
routes.put('/usuarios/admin/:id', adminOnly, validate(updateAdminSchema), UsuarioController.updateAdmin);
routes.put('/usuarios/aluno/:id', adminOnly, validate(updateAlunoSchema), UsuarioController.updateAluno);
routes.delete('/usuarios/:id', adminOnly, UsuarioController.delete);

export default routes;