import FeedbackFinalService from '../services/FeedbackFinalService.js';

class FeedbackFinalController {
  // Criar ou atualizar feedback final para uma inscrição (aluno ou admin)
  async store(req, res) {
    try {
      const { curso_id, aluno_id, objetivo_atingido, resultado_esperado, avaliacao } =
        req.body;

      if (!curso_id) {
        return res.status(400).json({ error: 'O ID do curso é obrigatório.' });
      }

      const alunoIdEfetivo =
        req.userRole === 'ADMIN' && aluno_id ? aluno_id : req.userId;

      const feedback = await FeedbackFinalService.upsertByAlunoECurso(
        alunoIdEfetivo,
        curso_id,
        { objetivo_atingido, resultado_esperado, avaliacao },
      );

      return res.status(201).json(feedback);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  // Buscar feedback final de um aluno para um curso
  async show(req, res) {
    try {
      const { curso_id } = req.params;
      const aluno_id = req.userId;

      const feedback = await FeedbackFinalService.findByAlunoECurso(
        aluno_id,
        curso_id,
      );

      return res.json(feedback);
    } catch (e) {
      return res.status(404).json({ error: e.message });
    }
  }
}

export default new FeedbackFinalController();

