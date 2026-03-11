import QuestionarioInicialService from '../services/QuestionarioInicialService.js';

class QuestionarioInicialController {
  // Criar ou atualizar questionário inicial para uma inscrição (aluno ou admin)
  async store(req, res) {
    try {
      const { curso_id, aluno_id, maior_dor_inicio, principal_expectativa } = req.body;

      if (!curso_id) {
        return res.status(400).json({ error: 'O ID do curso é obrigatório.' });
      }

      const alunoIdEfetivo =
        req.userRole === 'ADMIN' && aluno_id ? aluno_id : req.userId;

      const questionario = await QuestionarioInicialService.upsertByAlunoECurso(
        alunoIdEfetivo,
        curso_id,
        { maior_dor_inicio, principal_expectativa },
      );

      return res.status(201).json(questionario);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  // Buscar questionário inicial de um aluno para um curso
  async show(req, res) {
    try {
      const { curso_id } = req.params;
      const aluno_id = req.userId;

      const questionario = await QuestionarioInicialService.findByAlunoECurso(
        aluno_id,
        curso_id,
      );

      return res.json(questionario);
    } catch (e) {
      return res.status(404).json({ error: e.message });
    }
  }
}

export default new QuestionarioInicialController();

