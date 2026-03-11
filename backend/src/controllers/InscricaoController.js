import InscricaoService from '../services/InscricaoService.js';

class InscricaoController {
  // --- REALIZAR INSCRIÇÃO ---
  async store(req, res) {
    try {
      const { curso_id } = req.body;
      
      // Se for ADMIN, ele pode passar o aluno_id no corpo da requisição.
      // Se for ALUNO, usamos o ID dele que vem do token (segurança).
      const aluno_id = req.userRole === 'ADMIN' && req.body.aluno_id 
        ? req.body.aluno_id 
        : req.userId;

      if (!curso_id) {
        return res.status(400).json({ error: 'O ID do curso é obrigatório.' });
      }

      const inscricao = await InscricaoService.create(aluno_id, curso_id);
      return res.status(201).json(inscricao);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  // --- LISTAR MINHAS INSCRIÇÕES (ALUNO LOGADO) ---
  async myEnrollments(req, res) {
    try {
      // O req.userId vem do authMiddleware
      const cursos = await InscricaoService.findByAluno(req.userId);
      return res.json(cursos);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  // --- CANCELAR INSCRIÇÃO / REMOVER ALUNO ---
  async delete(req, res) {
    try {
      const { curso_id } = req.params;
      
      // Se for ADMIN, ele pode passar o aluno_id via query string ou corpo.
      // Se for ALUNO, ele só pode excluir a própria inscrição.
      const aluno_id = req.userRole === 'ADMIN' && req.body.aluno_id 
        ? req.body.aluno_id 
        : req.userId;

      await InscricaoService.delete(aluno_id, curso_id);
      return res.status(204).send();
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }
}

export default new InscricaoController();