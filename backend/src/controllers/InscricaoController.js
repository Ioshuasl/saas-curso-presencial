import InscricaoService from '../services/InscricaoService.js';
import { resolveTenantIdForAdminRequest } from '../utils/tenantAdminContext.js';
import { isAdminLikeRole } from '../utils/roles.js';

class InscricaoController {
  async store(req, res) {
    try {
      const { curso_id } = req.body;

      const tenantId = await resolveTenantIdForAdminRequest(req);
      const isAdminLike = isAdminLikeRole(req.userRole);

      const aluno_id =
        isAdminLike && req.body.aluno_id
          ? req.body.aluno_id
          : req.userId;

      if (!curso_id) {
        return res.status(400).json({ error: 'O ID do curso é obrigatório.' });
      }

      const inscricao = await InscricaoService.create(
        aluno_id,
        curso_id,
        null,
        tenantId,
      );
      return res.status(201).json(inscricao);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async myEnrollments(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req);
      const isAdminLike = isAdminLikeRole(req.userRole);

      const alunoIdEfetivo =
        isAdminLike && req.query?.aluno_id
          ? Number(req.query.aluno_id)
          : req.userId;

      if (isAdminLike && req.query?.aluno_id && (!Number.isInteger(alunoIdEfetivo) || alunoIdEfetivo < 1)) {
        return res.status(400).json({ error: 'aluno_id inválido' });
      }

      const cursos = await InscricaoService.findByAluno(alunoIdEfetivo, tenantId);
      return res.json(cursos);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async delete(req, res) {
    try {
      const { curso_id } = req.params;

      const tenantId = await resolveTenantIdForAdminRequest(req);
      const isAdminLike = isAdminLikeRole(req.userRole);

      const aluno_id =
        isAdminLike && req.body.aluno_id
          ? req.body.aluno_id
          : req.userId;

      await InscricaoService.delete(aluno_id, curso_id, tenantId);
      return res.status(204).send();
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async confirmarPresenca(req, res) {
    try {
      const { curso_id } = req.params;

      if (!curso_id) {
        return res.status(400).json({ error: 'O ID do curso é obrigatório.' });
      }

      const tenantId = await resolveTenantIdForAdminRequest(req);
      const isAdminLike = isAdminLikeRole(req.userRole);

      const aluno_id =
        isAdminLike && req.body.aluno_id
          ? req.body.aluno_id
          : req.userId;

      const inscricao = await InscricaoService.confirmarPresenca(
        aluno_id,
        curso_id,
        tenantId,
      );

      return res.json(inscricao);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async findByCurso(req, res) {
    try {
      const cursoId = Number(req.params.curso_id);
      if (!Number.isInteger(cursoId) || cursoId < 1) {
        return res.status(400).json({ error: 'curso_id inválido' });
      }

      const tenantId = await resolveTenantIdForAdminRequest(req);
      const curso = await InscricaoService.findByCurso(cursoId, tenantId);
      return res.json(curso);
    } catch (e) {
      if (e.message === 'Curso não encontrado') {
        return res.status(404).json({ error: e.message });
      }
      return res.status(400).json({ error: e.message });
    }
  }

  /**
   * GET /inscricoes/contagem
   * Query opcional: curso_id, aluno_id,
   * created_at (YYYY-MM-DD, um dia), created_at_inicio, created_at_fim (intervalo em `created_at`).
   */
  async count(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req);
      const total = await InscricaoService.count(tenantId, {
        curso_id: req.query.curso_id,
        aluno_id: req.query.aluno_id,
        created_at: req.query.created_at,
        created_at_inicio: req.query.created_at_inicio,
        created_at_fim: req.query.created_at_fim,
      });
      return res.json({ total });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }
}

export default new InscricaoController();
