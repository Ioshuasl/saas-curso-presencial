import { Op } from 'sequelize';
import { Inscricao, Usuario, PerfilAluno, Curso, SessaoCurso } from '../models/index.js';
import CursoService from './CursoService.js';
import { mergeTenantWhere, requireTenantId, whereTenantOnly } from '../utils/tenantScope.js';

function parseYmd(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return null;
  const d = new Date(`${value.trim()}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

class InscricaoService {
  async create(aluno_id, curso_id, transaction, tenant_id) {
    const tid = requireTenantId(tenant_id);
    const txOpts = transaction ? { transaction } : undefined;

    const curso = await Curso.findOne({
      where: mergeTenantWhere(tid, { id: curso_id }),
      ...txOpts,
    });
    if (!curso) {
      throw new Error('Curso não encontrado');
    }

    const aluno = await Usuario.findOne({
      where: mergeTenantWhere(tid, { id: aluno_id }),
      ...txOpts,
    });
    if (!aluno) {
      throw new Error('Aluno não encontrado');
    }

    const infoVagas = await CursoService.getVagasInfo(curso_id, tid);

    if (!infoVagas.tem_vaga) {
      throw new Error('Não há vagas disponíveis para este curso.');
    }

    const inscricaoExistente = await Inscricao.findOne({
      where: mergeTenantWhere(tid, { aluno_id, curso_id }),
      ...txOpts,
    });

    if (inscricaoExistente) {
      throw new Error('Este aluno já está matriculado neste curso.');
    }

    return await Inscricao.create(
      {
        aluno_id,
        curso_id,
        tenant_id: tid,
        data_inscricao: new Date(),
      },
      txOpts,
    );
  }

  async findByCurso(curso_id, tenantId) {
    const tid = requireTenantId(tenantId);
    const curso = await Curso.findOne({
      where: mergeTenantWhere(tid, { id: curso_id }),
      attributes: [
        'id',
        'tenant_id',
        'url_imagem',
        'nome',
        'ministrante',
        'descricao',
        'conteudo',
        'valor',
        'vagas',
        'local',
        'status',
        'created_at',
        'updated_at',
      ],
      include: [
        {
          model: SessaoCurso,
          as: 'sessoes',
          where: mergeTenantWhere(tid, {}),
          required: false,
        },
        {
          model: Usuario,
          as: 'alunos_inscritos',
          where: mergeTenantWhere(tid, { role: 'ALUNO' }),
          required: false,
          attributes: ['id', 'tenant_id', 'username', 'email', 'cpf', 'status', 'created_at', 'updated_at'],
          include: [
            {
              model: PerfilAluno,
              as: 'perfil_aluno',
              where: mergeTenantWhere(tid, {}),
              required: false,
            },
          ],
          through: {
            attributes: ['id', 'data_inscricao', 'presenca_confirmada', 'created_at', 'updated_at'],
          },
        },
      ],
    });

    if (!curso) throw new Error('Curso não encontrado');
    return curso;
  }

  async findByAluno(aluno_id, tenantId) {
    const tid = requireTenantId(tenantId);
    const aluno = await Usuario.findOne({
      where: mergeTenantWhere(tid, { id: aluno_id }),
      attributes: ['id', 'username'],
      include: [
        {
          model: Curso,
          as: 'cursos_inscritos',
          where: whereTenantOnly(tid),
          required: false,
          include: [{ model: SessaoCurso, as: 'sessoes' }],
          through: { attributes: ['data_inscricao'] },
        },
      ],
    });

    if (!aluno) throw new Error('Aluno não encontrado');
    return aluno.cursos_inscritos;
  }

  async delete(aluno_id, curso_id, tenantId) {
    const tid = requireTenantId(tenantId);
    const inscricao = await Inscricao.findOne({
      where: mergeTenantWhere(tid, { aluno_id, curso_id }),
    });

    if (!inscricao) {
      throw new Error('Inscrição não encontrada para este aluno neste curso.');
    }

    await inscricao.destroy();
    return true;
  }

  async confirmarPresenca(aluno_id, curso_id, tenantId) {
    const tid = requireTenantId(tenantId);
    const inscricao = await Inscricao.findOne({
      where: mergeTenantWhere(tid, { aluno_id, curso_id }),
    });

    if (!inscricao) {
      throw new Error('Inscrição não encontrada para este aluno neste curso.');
    }

    inscricao.presenca_confirmada = true;
    await inscricao.save();

    return inscricao;
  }

  /**
   * Conta inscrições do tenant com filtros opcionais.
   * @param {string|number} tenantId
   * @param {{ curso_id?: number, aluno_id?: number, created_at?: string, created_at_inicio?: string, created_at_fim?: string }} [params]
   *   - `created_at` (YYYY-MM-DD): apenas esse dia (equivalente a inicio=fim).
   *   - `created_at_inicio` / `created_at_fim`: intervalo em `created_at` do registro.
   * @returns {Promise<number>}
   */
  async count(tenantId, params = {}) {
    const tid = requireTenantId(tenantId);
    let { curso_id, aluno_id, created_at, created_at_inicio, created_at_fim } = params;

    if (
      typeof created_at === 'string' &&
      created_at.trim() &&
      !String(created_at_inicio ?? '').trim() &&
      !String(created_at_fim ?? '').trim()
    ) {
      const day = created_at.trim();
      created_at_inicio = day;
      created_at_fim = day;
    }

    const extra = {};

    if (curso_id != null && curso_id !== '') {
      const id = Number.parseInt(String(curso_id), 10);
      if (!Number.isInteger(id) || id < 1) {
        throw new Error('curso_id inválido');
      }
      extra.curso_id = id;
    }

    if (aluno_id != null && aluno_id !== '') {
      const id = Number.parseInt(String(aluno_id), 10);
      if (!Number.isInteger(id) || id < 1) {
        throw new Error('aluno_id inválido');
      }
      extra.aluno_id = id;
    }

    const range = {};
    if (typeof created_at_inicio === 'string' && created_at_inicio.trim()) {
      const d = parseYmd(created_at_inicio);
      if (!d) throw new Error('created_at_inicio deve ser YYYY-MM-DD');
      range[Op.gte] = d;
    }
    if (typeof created_at_fim === 'string' && created_at_fim.trim()) {
      const d = parseYmd(created_at_fim);
      if (!d) throw new Error('created_at_fim deve ser YYYY-MM-DD');
      const fim = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      range[Op.lte] = fim;
    }
    if (Object.keys(range).length) {
      extra.createdAt = range;
    }

    const where = mergeTenantWhere(tid, extra);
    const n = await Inscricao.count({ where });
    return Number.isFinite(n) ? n : 0;
  }
}

export default new InscricaoService();
