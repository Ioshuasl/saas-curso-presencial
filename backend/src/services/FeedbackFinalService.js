import { Inscricao, FeedbackFinal } from '../models/index.js';

class FeedbackFinalService {
  async upsertByAlunoECurso(aluno_id, curso_id, dados) {
    const inscricao = await Inscricao.findOne({
      where: { aluno_id, curso_id },
    });

    if (!inscricao) {
      throw new Error('Inscrição não encontrada para este aluno neste curso.');
    }

    const existente = await FeedbackFinal.findOne({
      where: { inscricao_id: inscricao.id },
    });

    if (existente) {
      await existente.update({
        objetivo_atingido: dados.objetivo_atingido ?? existente.objetivo_atingido,
        resultado_esperado: dados.resultado_esperado ?? existente.resultado_esperado,
        avaliacao: dados.avaliacao ?? existente.avaliacao,
      });
      return existente;
    }

    return await FeedbackFinal.create({
      inscricao_id: inscricao.id,
      objetivo_atingido: dados.objetivo_atingido,
      resultado_esperado: dados.resultado_esperado,
      avaliacao: dados.avaliacao,
    });
  }

  async findByAlunoECurso(aluno_id, curso_id) {
    const inscricao = await Inscricao.findOne({
      where: { aluno_id, curso_id },
    });

    if (!inscricao) {
      throw new Error('Inscrição não encontrada para este aluno neste curso.');
    }

    const feedback = await FeedbackFinal.findOne({
      where: { inscricao_id: inscricao.id },
    });

    if (!feedback) {
      throw new Error('Feedback final não encontrado para esta inscrição.');
    }

    return feedback;
  }
}

export default new FeedbackFinalService();

