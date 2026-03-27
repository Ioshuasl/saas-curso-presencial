import { Inscricao, FeedbackFinal } from '../models/index.js';
import { mergeTenantWhere, requireTenantId } from '../utils/tenantScope.js';

class FeedbackFinalService {
  async upsertByAlunoECurso(aluno_id, curso_id, dados, tenantId) {
    const tid = requireTenantId(tenantId);
    const inscricao = await Inscricao.findOne({
      where: mergeTenantWhere(tid, { aluno_id, curso_id }),
    });

    if (!inscricao) {
      throw new Error('Inscrição não encontrada para este aluno neste curso.');
    }

    const existente = await FeedbackFinal.findOne({
      where: mergeTenantWhere(tid, { inscricao_id: inscricao.id }),
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
      tenant_id: tid,
      objetivo_atingido: dados.objetivo_atingido,
      resultado_esperado: dados.resultado_esperado,
      avaliacao: dados.avaliacao,
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

    const feedback = await FeedbackFinal.findOne({
      where: mergeTenantWhere(tid, { inscricao_id: inscricao.id }),
    });

    if (!feedback) {
      throw new Error('Feedback final não encontrado para esta inscrição.');
    }

    return feedback;
  }
}

export default new FeedbackFinalService();
