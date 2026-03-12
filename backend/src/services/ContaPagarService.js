import { ContaPagar, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

class ContaPagarService {
  // --- CRIAR CONTA A PAGAR ---
  async create(dados) {
    return await ContaPagar.create(dados);
  }

  // --- LISTAR COM FILTROS E PAGINAÇÃO ---
  async findAll(params = {}) {
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

    const where = {};

    if (descricao != null && String(descricao).trim() !== '') {
      where.descricao = { [Op.iLike]: `%${String(descricao).trim()}%` };
    }
    if (categoria != null && String(categoria).trim() !== '') {
      where.categoria = { [Op.iLike]: `%${String(categoria).trim()}%` };
    }
    if (status != null && String(status).trim() !== '') {
      const s = String(status).toUpperCase();
      if (['PENDENTE', 'PAGO', 'ATRASADO'].includes(s)) {
        where.status = s;
      }
    }
    if (curso_id != null && curso_id !== '') {
      const id = parseInt(curso_id, 10);
      if (!Number.isNaN(id)) where.curso_id = id;
    }
    if (data_vencimento_inicio != null && String(data_vencimento_inicio).trim() !== '') {
      where.data_vencimento = where.data_vencimento || {};
      where.data_vencimento[Op.gte] = String(data_vencimento_inicio).trim();
    }
    if (data_vencimento_fim != null && String(data_vencimento_fim).trim() !== '') {
      where.data_vencimento = where.data_vencimento || {};
      where.data_vencimento[Op.lte] = String(data_vencimento_fim).trim();
    }

    const { count, rows } = await ContaPagar.findAndCountAll({
      where: Object.keys(where).length ? where : undefined,
      order: [[sortField, sortOrder]],
      limit: limitNum,
      offset,
    });

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

  // --- BUSCAR CONTA A PAGAR POR ID ---
  async findById(id) {
    const conta = await ContaPagar.findByPk(id);
    if (!conta) throw new Error('Conta a pagar não encontrada');
    return conta;
  }

  // --- ATUALIZAR CONTA A PAGAR ---
  async update(id, dados) {
    const t = await sequelize.transaction();
    try {
      const conta = await ContaPagar.findByPk(id);
      if (!conta) throw new Error('Conta a pagar não encontrada');

      await conta.update(dados, { transaction: t });
      await t.commit();
      return conta;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // --- EXCLUIR CONTA A PAGAR ---
  async delete(id) {
    const conta = await ContaPagar.findByPk(id);
    if (!conta) throw new Error('Conta a pagar não encontrada');
    await conta.destroy();
    return true;
  }
}

export default new ContaPagarService();

