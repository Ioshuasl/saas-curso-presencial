import QuestionarioInicialService from '../services/QuestionarioInicialService.js';
import { resolveTenantIdForAdminRequest } from '../utils/tenantAdminContext.js';
import { isAdminLikeRole } from '../utils/roles.js';

class QuestionarioInicialController {
  async store(req, res) {
    try {
      const { curso_id, aluno_id, maior_dor_inicio, principal_expectativa } = req.body;

      if (!curso_id) {
        return res.status(400).json({ error: 'O ID do curso é obrigatório.' });
      }

      const tenantId = await resolveTenantIdForAdminRequest(req);
      const isAdminLike = isAdminLikeRole(req.userRole);

      const alunoIdEfetivo = isAdminLike && aluno_id ? aluno_id : req.userId;

      const questionario = await QuestionarioInicialService.upsertByAlunoECurso(
        alunoIdEfetivo,
        curso_id,
        { maior_dor_inicio, principal_expectativa },
        tenantId,
      );

      return res.status(201).json(questionario);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async show(req, res) {
    try {
      const { curso_id } = req.params;
      const tenantId = await resolveTenantIdForAdminRequest(req);
      const isAdminLike = isAdminLikeRole(req.userRole);

      const aluno_id =
        isAdminLike && req.query?.aluno_id ? Number(req.query.aluno_id) : req.userId;

      if (isAdminLike && req.query?.aluno_id && (!Number.isInteger(aluno_id) || aluno_id < 1)) {
        return res.status(400).json({ error: 'aluno_id inválido' });
      }

      const questionario = await QuestionarioInicialService.findByAlunoECurso(
        aluno_id,
        curso_id,
        tenantId,
      );

      return res.json(questionario);
    } catch (e) {
      return res.status(404).json({ error: e.message });
    }
  }
}

export default new QuestionarioInicialController();
