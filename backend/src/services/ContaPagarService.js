import { ContaPagar, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import { omitTenantContext } from '../utils/tenantContext.js';
import { mergeTenantWhere, requireTenantId } from '../utils/tenantScope.js';

class ContaPagarService {
  async create(tenantId, dados) {
    const tid = requireTenantId(tenantId);
    const payload = omitTenantContext(dados);
    const { curso_id } = payload;
    if (curso_id != null) {
      const { Curso } = await import('../models/index.js');
      const curso = await Curso.findOne({
        where: mergeTenantWhere(tid, { id: curso_id }),
      });
      if (!curso) throw new Error('curso_id não pertence a este tenant');
    }

    return await ContaPagar.create({ ...payload, tenant_id: tid });
  }

  async findAll(tenantId, params = {}) {
    const tid = requireTenantId(tenantId);
    const {
      page = 1,
      limit = 10,
      descricao,
      categoria,
      status,
      curso_id,
      data_vencimento_inicio,
      data_vencimento_fim,
      sort = 'data_vencimento',
      order = 'ASC',
    } = params;

    const allowedSort = ['id', 'descricao', 'categoria', 'valor', 'data_vencimento', 'data_pagamento', 'status', 'curso_id', 'created_at'];
    const sortField = allowedSort.includes(sort) ? sort : 'data_vencimento';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const extra = {};

    if (descricao != null && String(descricao).trim() !== '') {
      extra.descricao = { [Op.iLike]: `%${String(descricao).trim()}%` };
    }
    if (categoria != null && String(categoria).trim() !== '') {
      extra.categoria = { [Op.iLike]: `%${String(categoria).trim()}%` };
    }
    if (status != null && String(status).trim() !== '') {
      const s = String(status).toUpperCase();
      if (['PENDENTE', 'PAGO', 'ATRASADO'].includes(s)) {
        extra.status = s;
      }
    }
    if (curso_id != null && curso_id !== '') {
      const id = parseInt(curso_id, 10);
      if (!Number.isNaN(id)) extra.curso_id = id;
    }
    if (data_vencimento_inicio != null && String(data_vencimento_inicio).trim() !== '') {
      extra.data_vencimento = extra.data_vencimento || {};
      extra.data_vencimento[Op.gte] = String(data_vencimento_inicio).trim();
    }
    if (data_vencimento_fim != null && String(data_vencimento_fim).trim() !== '') {
      extra.data_vencimento = extra.data_vencimento || {};
      extra.data_vencimento[Op.lte] = String(data_vencimento_fim).trim();
    }

    const where = mergeTenantWhere(tid, extra);

    const { count, rows } = await ContaPagar.findAndCountAll({
      where,
      order: [[sortField, sortOrder]],
      limit: limitNum,
      offset,
    });

    // Defesa em profundidade para evitar qualquer vazamento cross-tenant
    // caso exista dado legado inconsistente.
    const safeRows = rows.filter((row) => Number(row?.tenant_id) === Number(tid));

    const safeCount = safeRows.length < rows.length ? safeRows.length : count;
    const totalPaginas = Math.ceil(safeCount / limitNum) || 1;

    return {
      data: safeRows,
      paginacao: {
        total: safeCount,
        total_paginas: totalPaginas,
        pagina: pageNum,
        por_pagina: limitNum,
      },
    };
  }

  /**
   * Soma `valor` das contas a pagar do tenant.
   * @param {string|number} tenantId
   * @param {{ data_inicio?: string, data_fim?: string }} [params] - YYYY-MM-DD; filtra por `data_vencimento`
   */
  async sumValor(tenantId, params = {}) {
    const tid = requireTenantId(tenantId);
    const { data_inicio, data_fim } = params;

    const extra = {};

    if (typeof data_inicio === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data_inicio.trim())) {
      extra.data_vencimento = { [Op.gte]: data_inicio.trim() };
    }
    if (typeof data_fim === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data_fim.trim())) {
      const fim = data_fim.trim();
      if (extra.data_vencimento) {
        extra.data_vencimento[Op.lte] = fim;
      } else {
        extra.data_vencimento = { [Op.lte]: fim };
      }
    }

    const where = mergeTenantWhere(tid, extra);
    const raw = await ContaPagar.sum('valor', { where });
    const n = raw != null ? Number(raw) : 0;
    return Number.isFinite(n) ? n : 0;
  }

  async findById(id, tenantId) {
    const tid = requireTenantId(tenantId);
    const conta = await ContaPagar.findOne({ where: mergeTenantWhere(tid, { id }) });
    if (!conta) throw new Error('Conta a pagar não encontrada');
    if (Number(conta.tenant_id) !== Number(tid)) {
      throw new Error('Conta a pagar não pertence ao tenant autenticado');
    }
    return conta;
  }

  async update(id, tenantId, dados) {
    const tid = requireTenantId(tenantId);
    const t = await sequelize.transaction();
    try {
      const conta = await ContaPagar.findOne({
        where: mergeTenantWhere(tid, { id }),
        transaction: t,
      });
      if (!conta) throw new Error('Conta a pagar não encontrada');
      if (Number(conta.tenant_id) !== Number(tid)) {
        throw new Error('Conta a pagar não pertence ao tenant autenticado');
      }

      const payload = omitTenantContext(dados);
      const { curso_id } = payload;
      if (curso_id != null) {
        const { Curso } = await import('../models/index.js');
        const curso = await Curso.findOne({
          where: mergeTenantWhere(tid, { id: curso_id }),
          transaction: t,
        });
        if (!curso) throw new Error('curso_id não pertence a este tenant');
      }

      await conta.update(payload, { transaction: t });
      await t.commit();
      return conta;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async delete(id, tenantId) {
    const tid = requireTenantId(tenantId);
    const conta = await ContaPagar.findOne({ where: mergeTenantWhere(tid, { id }) });
    if (!conta) throw new Error('Conta a pagar não encontrada');
    if (Number(conta.tenant_id) !== Number(tid)) {
      throw new Error('Conta a pagar não pertence ao tenant autenticado');
    }
    await conta.destroy();
    return true;
  }
}

export default new ContaPagarService();
