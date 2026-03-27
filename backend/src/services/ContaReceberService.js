import { ContaReceber, ParcelaContaReceber, Usuario, Curso, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import { omitTenantContext } from '../utils/tenantContext.js';
import { mergeTenantWhere, requireTenantId } from '../utils/tenantScope.js';

class ContaReceberService {
  async create(tenantId, dados) {
    const tid = requireTenantId(tenantId);
    const t = await sequelize.transaction();
    let committed = false;

    try {
      const raw = omitTenantContext(dados);
      const { parcelas, ...cabecalho } = raw;

      // Segurança anti-vazamento:
      // valida que aluno_id e curso_id pertencem ao tenant informado.
      // (sem isso, a FK so garante a existencia, mas nao garante tenant)
      const { aluno_id, curso_id } = cabecalho;

      if (aluno_id != null) {
        const aluno = await Usuario.findOne({
          where: mergeTenantWhere(tid, { id: aluno_id, role: 'ALUNO' }),
          transaction: t,
        });
        if (!aluno) throw new Error('aluno_id não pertence a este tenant');
      }

      if (curso_id != null) {
        const curso = await Curso.findOne({
          where: mergeTenantWhere(tid, { id: curso_id }),
          transaction: t,
        });
        if (!curso) throw new Error('curso_id não pertence a este tenant');
      }

      const conta = await ContaReceber.create(
        { ...cabecalho, tenant_id: tid },
        { transaction: t }
      );

      if (parcelas && parcelas.length > 0) {
        const parcelasComFk = parcelas.map((parcela) => ({
          ...omitTenantContext(parcela),
          conta_receber_id: conta.id,
          tenant_id: tid,
        }));

        await ParcelaContaReceber.bulkCreate(parcelasComFk, { transaction: t });
      }

      await t.commit();
      committed = true;
      return await this.findById(conta.id, tid);
    } catch (error) {
      if (!committed) await t.rollback();
      throw error;
    }
  }

  async findAll(tenantId, params = {}) {
    const tid = requireTenantId(tenantId);
    const {
      page = 1,
      limit = 10,
      aluno_id,
      curso_id,
      forma_pagamento,
      sort = 'id',
      order = 'DESC',
    } = params;

    const allowedSort = ['id', 'aluno_id', 'curso_id', 'forma_pagamento', 'valor_total', 'created_at'];
    const sortField = allowedSort.includes(sort) ? sort : 'id';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const extra = {};

    if (aluno_id != null && aluno_id !== '') {
      const id = parseInt(aluno_id, 10);
      if (!Number.isNaN(id)) extra.aluno_id = id;
    }
    if (curso_id != null && curso_id !== '') {
      const id = parseInt(curso_id, 10);
      if (!Number.isNaN(id)) extra.curso_id = id;
    }
    if (forma_pagamento != null && String(forma_pagamento).trim() !== '') {
      const f = String(forma_pagamento).toUpperCase();
      if (['PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO'].includes(f)) {
        extra.forma_pagamento = f;
      }
    }

    const where = mergeTenantWhere(tid, extra);

    const include = [
      // No lado ContaReceber, as associações para Usuario/Curso usam o alias default do Sequelize
      // (porque `belongsTo` foi definido sem `as` em `models/index.js`).
      {
        model: Usuario,
        as: 'Usuario',
        where: mergeTenantWhere(tid, {}),
        required: false,
      },
      {
        model: Curso,
        as: 'Curso',
        where: mergeTenantWhere(tid, {}),
        required: false,
      },
      {
        model: ParcelaContaReceber,
        as: 'parcelas',
        where: mergeTenantWhere(tid, {}),
        required: false,
      },
    ];

    const { count, rows } = await ContaReceber.findAndCountAll({
      where,
      include,
      order: [[sortField, sortOrder]],
      limit: limitNum,
      offset,
      distinct: true,
    });

    // Defesa em profundidade para evitar vazamento cross-tenant
    // caso exista algum dado legado inconsistente.
    const safeRows = rows.filter((conta) => Number(conta?.tenant_id) === Number(tid))

    // Adiciona campos unificados para o frontend:
    // - parcelas_pagas: quantas parcelas já foram pagas
    // - parcelas_total: total de parcelas
    // - status: PENDENTE | PARCIAL | PAGO (derivado das parcelas.pago)
    const normalizedRows = safeRows.map((conta) => {
      const parcelas = (conta.parcelas ?? []).filter(
        (p) => Number(p?.tenant_id) === Number(tid),
      )
      const parcelasTotal = parcelas.length
      const parcelasPagas = parcelas.filter((p) => Boolean(p.pago)).length

      let status = 'PENDENTE'
      if (parcelasTotal > 0 && parcelasPagas === parcelasTotal) status = 'PAGO'
      else if (parcelasPagas > 0) status = 'PARCIAL'

      conta.setDataValue('parcelas_pagas', parcelasPagas)
      conta.setDataValue('parcelas_total', parcelasTotal)
      conta.setDataValue('status', status)

      return conta
    })

    const safeCount = safeRows.length < rows.length ? safeRows.length : count
    const totalPaginas = Math.ceil(safeCount / limitNum) || 1;

    return {
      data: normalizedRows,
      paginacao: {
        total: safeCount,
        total_paginas: totalPaginas,
        pagina: pageNum,
        por_pagina: limitNum,
      },
    };
  }

  /**
   * Soma `valor_total` das contas a receber do tenant.
   * @param {string|number} tenantId
   * @param {{ data_inicio?: string, data_fim?: string }} [params] - YYYY-MM-DD; filtra por `created_at`
   */
  async sumValorTotal(tenantId, params = {}) {
    const tid = requireTenantId(tenantId);
    const { data_inicio, data_fim } = params;

    const extra = {};

    if (typeof data_inicio === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data_inicio.trim())) {
      const d = new Date(`${data_inicio.trim()}T00:00:00`);
      if (!Number.isNaN(d.getTime())) {
        extra.createdAt = { [Op.gte]: d };
      }
    }
    if (typeof data_fim === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data_fim.trim())) {
      const d = new Date(`${data_fim.trim()}T00:00:00`);
      if (!Number.isNaN(d.getTime())) {
        const fim = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
        if (extra.createdAt) {
          extra.createdAt[Op.lte] = fim;
        } else {
          extra.createdAt = { [Op.lte]: fim };
        }
      }
    }

    const where = mergeTenantWhere(tid, extra);
    const raw = await ContaReceber.sum('valor_total', { where });
    const n = raw != null ? Number(raw) : 0;
    return Number.isFinite(n) ? n : 0;
  }

  async findById(id, tenantId) {
    const tid = requireTenantId(tenantId);
    const conta = await ContaReceber.findOne({
      where: mergeTenantWhere(tid, { id }),
      include: [
        {
          model: Usuario,
          as: 'Usuario',
          where: mergeTenantWhere(tid, {}),
          required: false,
        },
        {
          model: Curso,
          as: 'Curso',
          where: mergeTenantWhere(tid, {}),
          required: false,
        },
        {
          model: ParcelaContaReceber,
          as: 'parcelas',
          where: mergeTenantWhere(tid, {}),
          required: false,
        },
      ],
    });

    if (!conta) throw new Error('Conta a receber não encontrada');
    if (Number(conta.tenant_id) !== Number(tid)) {
      throw new Error('Conta a receber não pertence ao tenant autenticado');
    }

    const parcelas = (conta.parcelas ?? []).filter(
      (p) => Number(p?.tenant_id) === Number(tid),
    )
    const parcelasTotal = parcelas.length
    const parcelasPagas = parcelas.filter((p) => Boolean(p.pago)).length

    let status = 'PENDENTE'
    if (parcelasTotal > 0 && parcelasPagas === parcelasTotal) status = 'PAGO'
    else if (parcelasPagas > 0) status = 'PARCIAL'

    conta.setDataValue('parcelas_pagas', parcelasPagas)
    conta.setDataValue('parcelas_total', parcelasTotal)
    conta.setDataValue('status', status)

    return conta;
  }

  async update(id, tenantId, dados) {
    const tid = requireTenantId(tenantId);
    const t = await sequelize.transaction();
    let committed = false;

    try {
      const conta = await ContaReceber.findOne({
        where: mergeTenantWhere(tid, { id }),
        transaction: t,
      });
      if (!conta) throw new Error('Conta a receber não encontrada');
      if (Number(conta.tenant_id) !== Number(tid)) {
        throw new Error('Conta a receber não pertence ao tenant autenticado');
      }

      const raw = omitTenantContext(dados);
      const { parcelas, ...cabecalho } = raw;

      // Se atualizar aluno_id/curso_id, validar ownership no tenant.
      if (cabecalho.aluno_id != null) {
        const aluno = await Usuario.findOne({
          where: mergeTenantWhere(tid, { id: cabecalho.aluno_id, role: 'ALUNO' }),
          transaction: t,
        });
        if (!aluno) throw new Error('aluno_id não pertence a este tenant');
      }
      if (cabecalho.curso_id != null) {
        const curso = await Curso.findOne({
          where: mergeTenantWhere(tid, { id: cabecalho.curso_id }),
          transaction: t,
        });
        if (!curso) throw new Error('curso_id não pertence a este tenant');
      }

      await conta.update(cabecalho, { transaction: t });

      if (parcelas) {
        await ParcelaContaReceber.destroy({
          where: { conta_receber_id: id, tenant_id: tid },
          transaction: t,
        });

        if (parcelas.length > 0) {
          const parcelasComFk = parcelas.map((parcela) => ({
            ...omitTenantContext(parcela),
            conta_receber_id: id,
            tenant_id: tid,
          }));

          await ParcelaContaReceber.bulkCreate(parcelasComFk, {
            transaction: t,
          });
        }
      }

      await t.commit();
      committed = true;
      return await this.findById(id, tid);
    } catch (error) {
      if (!committed) await t.rollback();
      throw error;
    }
  }

  async delete(id, tenantId) {
    const tid = requireTenantId(tenantId);
    const t = await sequelize.transaction();

    try {
      const conta = await ContaReceber.findOne({
        where: mergeTenantWhere(tid, { id }),
        transaction: t,
      });
      if (!conta) throw new Error('Conta a receber não encontrada');
      if (Number(conta.tenant_id) !== Number(tid)) {
        throw new Error('Conta a receber não pertence ao tenant autenticado');
      }

      await ParcelaContaReceber.destroy({
        where: { conta_receber_id: id, tenant_id: tid },
        transaction: t,
      });

      await conta.destroy({ transaction: t });

      await t.commit();
      return true;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async marcarParcelaComoPaga(conta_id, parcela_id, tenantId, data_pagamento = new Date()) {
    const tid = requireTenantId(tenantId);
    const conta = await ContaReceber.findOne({
      where: mergeTenantWhere(tid, { id: conta_id }),
    });
    if (!conta) {
      throw new Error('Conta a receber não encontrada');
    }

    const parcela = await ParcelaContaReceber.findOne({
      where: mergeTenantWhere(tid, {
        id: parcela_id,
        conta_receber_id: conta_id,
      }),
    });

    if (!parcela) {
      throw new Error('Parcela não encontrada para esta conta a receber.');
    }

    parcela.pago = true;
    parcela.data_pagamento = data_pagamento;

    await parcela.save();

    return parcela;
  }
}

export default new ContaReceberService();
