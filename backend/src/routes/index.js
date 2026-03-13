import express from 'express';
import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import usuarioRoutes from './UsuarioRoutes.js';
import cursoRoutes from './CursoRoutes.js';
import inscricaoRoutes from './InscricaoRoutes.js';
import questionarioInicialRoutes from './QuestionarioInicialRoutes.js';
import feedbackFinalRoutes from './FeedbackFinalRoutes.js';
import contaPagarRoutes from './ContaPagarRoutes.js';
import contaReceberRoutes from './ContaReceberRoutes.js';
import uploadRoutes from './UploadRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsPath = path.join(__dirname, '..', '..', 'uploads');

const routes = new Router();

// GET /api/uploads/:filename — servir arquivos enviados
routes.use('/uploads', express.static(uploadsPath));
routes.use('/uploads', uploadRoutes);
routes.use(usuarioRoutes);
routes.use(cursoRoutes);
routes.use(inscricaoRoutes);
routes.use(questionarioInicialRoutes);
routes.use(feedbackFinalRoutes);
routes.use(contaPagarRoutes);
routes.use(contaReceberRoutes);

export default routes;