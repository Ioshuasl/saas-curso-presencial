import { Curso, SessaoCurso, Inscricao, Usuario, PerfilAluno, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import { deleteFromS3 } from '../config/aws-s3.js';
import { omitTenantContext } from '../utils/tenantContext.js';
import { mergeTenantWhere, requireTenantId, whereTenantOnly } from '../utils/tenantScope.js';

function normalizeTime(value) {
  if (value == null) return value;
  const str = String(value).trim();
  if (/^\d{2}:\d{2}:\d{2}$/.test(str)) return str;
  if (/^\d{2}:\d{2}$/.test(str)) return `${str}:00`;
  return str;
}

class CursoService {
  async create(tenantId, dados) {
    const tid = requireTenantId(tenantId);
    const t = await sequelize.transaction();
    try {
      const payload = omitTenantContext(dados);
      const { sessoes, ...cursoFields } = payload;

      const curso = await Curso.create(
        { ...cursoFields, tenant_id: tid },
        { transaction: t }
      );

      if (sessoes && sessoes.length > 0) {
        const sessoesComId = sessoes.map((sessao) => ({
          ...omitTenantContext(sessao),
          curso_id: curso.id,
          tenant_id: tid,
        }));
        await SessaoCurso.bulkCreate(sessoesComId, { transaction: t });
      }

      await t.commit();
      return await Curso.findOne({
        where: mergeTenantWhere(tid, { id: curso.id }),
        include: [{ model: SessaoCurso, as: 'sessoes' }],
      });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async findAll(params = {}, tenantId) {
    const tid = requireTenantId(tenantId);
    const {
      page = 1,
      limit = 10,
      nome,
      ministrante,
      status,
      sort = 'id',
      order = 'DESC',
    } = params;

    const allowedSort = ['id', 'nome', 'ministrante', 'valor', 'vagas', 'local', 'status', 'created_at'];
    const sortField = allowedSort.includes(sort) ? sort : 'id';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const extra = {};

    if (nome != null && String(nome).trim() !== '') {
      extra.nome = { [Op.iLike]: `%${String(nome).trim()}%` };
    }
    if (ministrante != null && String(ministrante).trim() !== '') {
      extra.ministrante = { [Op.iLike]: `%${String(ministrante).trim()}%` };
    }
    if (status !== undefined && status !== '') {
      extra.status = status === 'true' || status === true;
    }

    const where = mergeTenantWhere(tid, extra);

    const { count, rows } = await Curso.findAndCountAll({
      where,
      order: [[sortField, sortOrder]],
      limit: limitNum,
      offset,
    });

    if (rows.length > 0) {
      const cursoIds = rows.map((curso) => curso.id);
      const inscricoesPorCurso = await Inscricao.findAll({
        where: mergeTenantWhere(tid, { curso_id: { [Op.in]: cursoIds } }),
        attributes: [
          'curso_id',
          [sequelize.fn('COUNT', sequelize.col('id')), 'vagas_preenchidas'],
        ],
        group: ['curso_id'],
        raw: true,
      });

      const vagasByCursoId = new Map(
        inscricoesPorCurso.map((item) => [Number(item.curso_id), Number(item.vagas_preenchidas) || 0]),
      );

      rows.forEach((curso) => {
        curso.setDataValue('vagas_preenchidas', vagasByCursoId.get(Number(curso.id)) ?? 0);
      });
    }

    const totalPaginas = Math.ceil(count / limitNum) || 1;

    return {
      data: rows,
      paginacao: {
        total: count,
        total_paginas: totalPaginas,
        pagina: pageNum,
        por_pagina: limitNum,
      },
    };
  }

  async findBySessionDate(data, tenantId) {
    const tid = requireTenantId(tenantId);
    const rows = await Curso.findAll({
      where: whereTenantOnly(tid),
      include: [
        {
          model: SessaoCurso,
          as: 'sessoes',
          where: { data },
          required: true,
        },
      ],
      order: [['id', 'DESC']],
    });

    // Total de inscrições por curso (para exibir na agenda).
    // Mantemos o mesmo nome de campo já usado em outras telas (`vagas_preenchidas`)
    // porque a UI já sabe lidar com esse padrão.
    const cursoIds = rows.map((c) => Number(c?.id)).filter((id) => Number.isInteger(id));
    if (cursoIds.length) {
      const inscricoesPorCurso = await Inscricao.findAll({
        where: mergeTenantWhere(tid, { curso_id: { [Op.in]: cursoIds } }),
        attributes: [
          'curso_id',
          [sequelize.fn('COUNT', sequelize.col('id')), 'vagas_preenchidas'],
        ],
        group: ['curso_id'],
        raw: true,
      });

      const vagasByCursoId = new Map(
        inscricoesPorCurso.map((item) => [Number(item.curso_id), Number(item.vagas_preenchidas) || 0]),
      );

      rows.forEach((curso) => {
        curso.setDataValue(
          'vagas_preenchidas',
          vagasByCursoId.get(Number(curso.id)) ?? 0,
        );
      });
    }

    return rows;
  }

  async findById(id, tenantId) {
    const tid = requireTenantId(tenantId);
    const curso = await Curso.findOne({
      where: mergeTenantWhere(tid, { id }),
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
          attributes: ['id', 'username', 'email', 'cpf', 'status'],
          include: [
            {
              model: PerfilAluno,
              as: 'perfil_aluno',
              where: mergeTenantWhere(tid, {}),
              required: false,
            },
          ],
          through: {
            attributes: ['id', 'data_inscricao', 'presenca_confirmada', 'created_at'],
          },
        },
      ],
    });
    if (!curso) throw new Error('Curso não encontrado');

    const vagasPreenchidas = await Inscricao.count({
      where: mergeTenantWhere(tid, { curso_id: id }),
    });
    curso.setDataValue('vagas_preenchidas', vagasPreenchidas);

    return curso;
  }

  async update(id, tenantId, dados) {
    const tid = requireTenantId(tenantId);
    const t = await sequelize.transaction();
    try {
      const curso = await Curso.findOne({
        where: mergeTenantWhere(tid, { id }),
        transaction: t,
      });
      if (!curso) throw new Error('Curso não encontrado');

      const raw = omitTenantContext(dados);
      const { sessoes, ...cursoFields } = raw;
      const oldImageUrl = curso.url_imagem;

      await curso.update(cursoFields, { transaction: t });

      if (Array.isArray(sessoes)) {
        const sessoesExistentes = await SessaoCurso.findAll({
          where: { curso_id: id, tenant_id: tid },
          attributes: ['id'],
          transaction: t,
        });
        const existingIds = new Set(sessoesExistentes.map((sessao) => Number(sessao.id)));

        const incomingWithId = new Set();
        const novasSessoes = [];

        for (const sessao of sessoes) {
          const cleaned = omitTenantContext(sessao);
          const payloadSessao = {
            data: cleaned.data,
            horario_inicio: normalizeTime(cleaned.horario_inicio),
            horario_fim: normalizeTime(cleaned.horario_fim),
          };

          const sessaoId = Number(cleaned.id);
          if (Number.isInteger(sessaoId) && existingIds.has(sessaoId)) {
            incomingWithId.add(sessaoId);
            await SessaoCurso.update(payloadSessao, {
              where: { id: sessaoId, curso_id: id, tenant_id: tid },
              transaction: t,
            });
          } else {
            novasSessoes.push({
              ...payloadSessao,
              curso_id: id,
              tenant_id: tid,
            });
          }
        }

        const idsParaRemover = [...existingIds].filter((sessaoId) => !incomingWithId.has(sessaoId));
        if (idsParaRemover.length > 0) {
          await SessaoCurso.destroy({
            where: { id: idsParaRemover, curso_id: id, tenant_id: tid },
            transaction: t,
          });
        }

        if (novasSessoes.length > 0) {
          await SessaoCurso.bulkCreate(novasSessoes, { transaction: t });
        }
      }

      await t.commit();

      if (
        cursoFields.url_imagem !== undefined &&
        oldImageUrl &&
        oldImageUrl !== cursoFields.url_imagem
      ) {
        await deleteFromS3(oldImageUrl).catch(() => {});
      }

      return await this.findById(id, tid);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async delete(id, tenantId) {
    const tid = requireTenantId(tenantId);
    const curso = await Curso.findOne({ where: mergeTenantWhere(tid, { id }) });
    if (!curso) throw new Error('Curso não encontrado');

    const t = await sequelize.transaction();
    try {
      if (curso.url_imagem) {
        await deleteFromS3(curso.url_imagem).catch(() => {});
      }

      await SessaoCurso.destroy({ where: { curso_id: id, tenant_id: tid }, transaction: t });
      await curso.destroy({ transaction: t });
      await t.commit();
      return true;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async findCursosByAlunoId(aluno_id, tenantId) {
    const tid = requireTenantId(tenantId);
    const aluno = await Usuario.findOne({
      where: mergeTenantWhere(tid, { id: aluno_id }),
    });
    if (!aluno) throw new Error('Aluno não encontrado');

    return await Curso.findAll({
      where: whereTenantOnly(tid),
      include: [
        { model: SessaoCurso, as: 'sessoes' },
        {
          model: Usuario,
          as: 'alunos_inscritos',
          where: { id: aluno_id },
          required: true,
          attributes: [],
          through: { attributes: ['data_inscricao'] },
        },
      ],
      order: [['id', 'DESC']],
    });
  }

  async getVagasInfo(cursoId, tenantId) {
    const tid = requireTenantId(tenantId);
    const curso = await Curso.findOne({
      where: mergeTenantWhere(tid, { id: cursoId }),
      attributes: ['id', 'vagas'],
    });

    if (!curso) throw new Error('Curso não encontrado');

    const vagasPreenchidas = await Inscricao.count({
      where: mergeTenantWhere(tid, { curso_id: cursoId }),
    });

    const vagasTotais = curso.vagas;
    const vagasDisponiveis = vagasTotais - vagasPreenchidas;

    return {
      vagas_totais: vagasTotais,
      vagas_preenchidas: vagasPreenchidas,
      vagas_disponiveis: Math.max(0, vagasDisponiveis),
      tem_vaga: vagasDisponiveis > 0,
    };
  }
}

export default new CursoService();
