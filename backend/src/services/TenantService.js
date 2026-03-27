import { Tenant, Config, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import { requireTenantId } from '../utils/tenantScope.js';

/**
 * Gestão do próprio tenant do usuário autenticado (não lista todos os clientes da plataforma).
 */
class TenantService {
  async create(dados) {
    const t = await sequelize.transaction();
    try {
      const tenant = await Tenant.create(dados, { transaction: t });
      await Config.create(
        { tenant_id: tenant.id, settings: {} },
        { transaction: t }
      );
      await t.commit();
      return await Tenant.findByPk(tenant.id, {
        include: [{ model: Config, as: 'config' }],
      });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async findAll(params = {}, requesterTenantId, requesterRole) {
    const {
      page = 1,
      limit = 10,
      nome,
      ativo,
      sort = 'id',
      order = 'DESC',
    } = params;

    const allowedSort = ['id', 'nome', 'slug', 'ativo', 'created_at'];
    const sortField = allowedSort.includes(sort) ? sort : 'id';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const extra =
      requesterRole === 'SAAS_ADMIN'
        ? {}
        : { id: requireTenantId(requesterTenantId) };

    if (nome != null && String(nome).trim() !== '') {
      extra.nome = { [Op.iLike]: `%${String(nome).trim()}%` };
    }
    if (ativo !== undefined && ativo !== '') {
      extra.ativo = ativo === 'true' || ativo === true;
    }

    const { count, rows } = await Tenant.findAndCountAll({
      where: extra,
      order: [[sortField, sortOrder]],
      limit: limitNum,
      offset,
      include: [{ model: Config, as: 'config', required: false }],
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

  async findById(id, requesterTenantId, requesterRole) {
    const tid = requireTenantId(requesterTenantId);
    const idNum = Number(id);
    if (requesterRole !== 'SAAS_ADMIN' && idNum !== tid) {
      throw new Error('Tenant não encontrado');
    }
    const tenant = await Tenant.findByPk(id, {
      include: [{ model: Config, as: 'config', required: false }],
    });
    if (!tenant) throw new Error('Tenant não encontrado');
    return tenant;
  }

  async update(id, requesterTenantId, requesterRole, dados) {
    const tid = requireTenantId(requesterTenantId);
    const idNum = Number(id);
    if (requesterRole !== 'SAAS_ADMIN' && idNum !== tid) {
      throw new Error('Tenant não encontrado');
    }
    const t = await sequelize.transaction();
    try {
      const tenant = await Tenant.findByPk(id, { transaction: t });
      if (!tenant) throw new Error('Tenant não encontrado');

      const permitidos = {};
      if (dados.nome !== undefined) permitidos.nome = dados.nome;
      if (dados.slug !== undefined) permitidos.slug = dados.slug;
      if (dados.ativo !== undefined) permitidos.ativo = dados.ativo;

      await tenant.update(permitidos, { transaction: t });
      await t.commit();
      return await this.findById(id, tid, requesterRole);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async delete(id, requesterTenantId, requesterRole) {
    const tid = requireTenantId(requesterTenantId);
    const idNum = Number(id);
    if (requesterRole !== 'SAAS_ADMIN' && idNum !== tid) {
      throw new Error('Tenant não encontrado');
    }
    const tenant = await Tenant.findByPk(id);
    if (!tenant) throw new Error('Tenant não encontrado');
    await tenant.destroy();
    return true;
  }
}

export default new TenantService();
