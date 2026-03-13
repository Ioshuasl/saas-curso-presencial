import { Router } from 'express';
import CursoController from '../controllers/CursoController.js';
import { authMiddleware, adminOnly } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { uploadSingle } from '../middlewares/upload.js';
import { createCursoSchema, updateCursoSchema } from '../schema/CursoSchema.js';

const routes = new Router();

/**
 * @swagger
 * tags:
 *   name: Cursos
 *   description: Gestão de cursos e sessões
 */

// Rotas públicas (Alunos precisam ver os cursos disponíveis)
/**
 * @swagger
 * /cursos:
 *   get:
 *     summary: Listar cursos com filtros e paginação
 *     tags: [Cursos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista de cursos
 */
routes.get('/cursos', CursoController.index);
/**
 * @swagger
 * /cursos/{id}:
 *   get:
 *     summary: Buscar curso por ID (com sessões)
 *     tags: [Cursos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Curso encontrado
 */
routes.get('/cursos/:id', CursoController.show);
/**
 * @swagger
 * /cursos/{id}/vagas:
 *   get:
 *     summary: Consultar informações de vagas de um curso
 *     tags: [Cursos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Informações de vagas
 */
routes.get('/cursos/:id/vagas', CursoController.checkVagas);
/**
 * @swagger
 * /cursos/por-data:
 *   get:
 *     summary: Listar cursos que possuem sessões em uma data específica
 *     tags: [Cursos]
 *     parameters:
 *       - in: query
 *         name: data
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de cursos na data informada
 */
routes.get('/cursos/por-data', CursoController.byDate);

// Cursos do aluno logado (requer autenticação)
/**
 * @swagger
 * /cursos/meus:
 *   get:
 *     summary: Listar cursos do aluno autenticado
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cursos do aluno
 */
routes.get('/cursos/meus', authMiddleware, CursoController.meusCursos);

// Rotas protegidas (Apenas Admins gerenciam cursos)
/**
 * @swagger
 * /cursos:
 *   post:
 *     summary: Criar um novo curso (Admin)
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               imagem:
 *                 type: string
 *                 format: binary
 *                 description: Foto do curso (opcional)
 *               nome:
 *                 type: string
 *               ministrante:
 *                 type: string
 *               descricao:
 *                 type: string
 *               conteudo:
 *                 type: string
 *               valor:
 *                 type: number
 *               vagas:
 *                 type: integer
 *               local:
 *                 type: string
 *               status:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Curso criado
 */
routes.post('/cursos', authMiddleware, adminOnly, uploadSingle('imagem'), validate(createCursoSchema), CursoController.store);
/**
 * @swagger
 * /cursos/{id}:
 *   put:
 *     summary: Atualizar curso existente (Admin)
 *     tags: [Cursos]
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
 *         description: Curso atualizado
 */
routes.put('/cursos/:id', authMiddleware, adminOnly, validate(updateCursoSchema), CursoController.update);
/**
 * @swagger
 * /cursos/{id}:
 *   delete:
 *     summary: Excluir curso (Admin)
 *     tags: [Cursos]
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
 *         description: Curso excluído
 */
routes.delete('/cursos/:id', authMiddleware, adminOnly, CursoController.delete);
/**
 * @swagger
 * /cursos/{id}/alunos:
 *   get:
 *     summary: Listar alunos inscritos em um curso (Admin)
 *     tags: [Cursos]
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
 *         description: Lista de alunos
 */
routes.get('/cursos/:id/alunos', authMiddleware, adminOnly, CursoController.listAlunos);

export default routes;