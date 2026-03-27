import { Inscricao, QuestionarioInicial } from '../models/index.js';
import { mergeTenantWhere, requireTenantId } from '../utils/tenantScope.js';

class QuestionarioInicialService {
  async upsertByAlunoECurso(aluno_id, curso_id, dados, tenantId) {
    const tid = requireTenantId(tenantId);
    const inscricao = await Inscricao.findOne({
      where: mergeTenantWhere(tid, { aluno_id, curso_id }),
    });

    if (!inscricao) {
      throw new Error('Inscrição não encontrada para este aluno neste curso.');
    }

    const existente = await QuestionarioInicial.findOne({
      where: mergeTenantWhere(tid, { inscricao_id: inscricao.id }),
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
      tenant_id: tid,
      maior_dor_inicio: dados.maior_dor_inicio,
      principal_expectativa: dados.principal_expectativa,
    });
  }

  async findByAlunoECurso(aluno_id, curso_id, tenantId) {
    const tid = requireTenantId(tenantId);
    const inscricao = await Inscricao.findOne({
      where: mergeTenantWhere(tid, { aluno_id, curso_id }),
    });

    if (!inscricao) {
      throw new Error('Inscrição não encontrada para este aluno neste curso.');
    }

    const questionario = await QuestionarioInicial.findOne({
      where: mergeTenantWhere(tid, { inscricao_id: inscricao.id }),
    });

    if (!questionario) {
      throw new Error('Questionário inicial não encontrado para esta inscrição.');
    }

    return questionario;
  }
}

export default new QuestionarioInicialService();
