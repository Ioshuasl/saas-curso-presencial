import { Router } from 'express';
import usuarioRoutes from './UsuarioRoutes.js';
import cursoRoutes from './CursoRoutes.js';
import inscricaoRoutes from './InscricaoRoutes.js';
import questionarioInicialRoutes from './QuestionarioInicialRoutes.js';
import feedbackFinalRoutes from './FeedbackFinalRoutes.js';

const routes = new Router();

routes.use(usuarioRoutes);
routes.use(cursoRoutes);
routes.use(inscricaoRoutes);
routes.use(questionarioInicialRoutes);
routes.use(feedbackFinalRoutes);

export default routes;