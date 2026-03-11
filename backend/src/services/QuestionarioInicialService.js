import { Inscricao, QuestionarioInicial } from '../models/index.js';

class QuestionarioInicialService {
  async upsertByAlunoECurso(aluno_id, curso_id, dados) {
    const inscricao = await Inscricao.findOne({
      where: { aluno_id, curso_id },
    });

    if (!inscricao) {
      throw new Error('Inscrição não encontrada para este aluno neste curso.');
    }

    const existente = await QuestionarioInicial.findOne({
      where: { inscricao_id: inscricao.id },
    });

    if (existente) {
      await existente.update({
        maior_dor_inicio: dados.maior_dor_inicio ?? existente.maior_dor_inicio,
        principal_expectativa: dados.principal_expectativa ?? existente.principal_expectativa,
      });
      return existente;
    }

    return await QuestionarioInicial.create({
      inscricao_id: inscricao.id,
      maior_dor_inicio: dados.maior_dor_inicio,
      principal_expectativa: dados.principal_expectativa,
    });
  }

  async findByAlunoECurso(aluno_id, curso_id) {
    const inscricao = await Inscricao.findOne({
      where: { aluno_id, curso_id },
    });

    if (!inscricao) {
      throw new Error('Inscrição não encontrada para este aluno neste curso.');
    }

    const questionario = await QuestionarioInicial.findOne({
      where: { inscricao_id: inscricao.id },
    });

    if (!questionario) {
      throw new Error('Questionário inicial não encontrado para esta inscrição.');
    }

    return questionario;
  }
}

export default new QuestionarioInicialService();

