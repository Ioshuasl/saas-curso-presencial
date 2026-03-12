import { ContaReceber, ParcelaContaReceber, Usuario, Curso, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

class ContaReceberService {
  // --- CRIAR CONTA A RECEBER + PARCELAS ---
  async create(dados) {
    const t = await sequelize.transaction();

    try {
      const { parcelas, ...cabecalho } = dados;

      const conta = await ContaReceber.create(cabecalho, { transaction: t });

      if (parcelas && parcelas.length > 0) {
        const parcelasComFk = parcelas.map(parcela => ({
          ...parcela,
          conta_receber_id: conta.id,
        }));

        await ParcelaContaReceber.bulkCreate(parcelasComFk, { transaction: t });
      }

      await t.commit();
      return await this.findById(conta.id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // --- LISTAR CONTAS A RECEBER (com filtros e paginação) ---
  async findAll(params = {}) {
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

    const where = {};

    if (aluno_id != null && aluno_id !== '') {
      const id = parseInt(aluno_id, 10);
      if (!Number.isNaN(id)) where.aluno_id = id;
    }
    if (curso_id != null && curso_id !== '') {
      const id = parseInt(curso_id, 10);
      if (!Number.isNaN(id)) where.curso_id = id;
    }
    if (forma_pagamento != null && String(forma_pagamento).trim() !== '') {
      const f = String(forma_pagamento).toUpperCase();
      if (['PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO'].includes(f)) {
        where.forma_pagamento = f;
      }
    }

    const include = [
      { model: Usuario, as: 'contas_receber_aluno' },
      { model: Curso, as: 'contas_receber' },
      { model: ParcelaContaReceber, as: 'parcelas' },
    ];

    const { count, rows } = await ContaReceber.findAndCountAll({
      where: Object.keys(where).length ? where : undefined,
      include,
      order: [[sortField, sortOrder]],
      limit: limitNum,
      offset,
      distinct: true,
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

  // --- BUSCAR CONTA A RECEBER POR ID (COM PARCELAS) ---
  async findById(id) {
    const conta = await ContaReceber.findByPk(id, {
      include: [
        { model: Usuario, as: 'contas_receber_aluno' },
        { model: Curso, as: 'contas_receber' },
        { model: ParcelaContaReceber, as: 'parcelas' },
      ],
    });

    if (!conta) throw new Error('Conta a receber não encontrada');
    return conta;
  }

  // --- ATUALIZAR CABEÇALHO DA CONTA E (OPCIONALMENTE) RECRIAR PARCELAS ---
  async update(id, dados) {
    const t = await sequelize.transaction();

    try {
      const conta = await ContaReceber.findByPk(id);
      if (!conta) throw new Error('Conta a receber não encontrada');

      const { parcelas, ...cabecalho } = dados;

      await conta.update(cabecalho, { transaction: t });

      if (parcelas) {
        await ParcelaContaReceber.destroy({
          where: { conta_receber_id: id },
          transaction: t,
        });

        if (parcelas.length > 0) {
          const parcelasComFk = parcelas.map(parcela => ({
            ...parcela,
            conta_receber_id: id,
          }));

          await ParcelaContaReceber.bulkCreate(parcelasComFk, {
            transaction: t,
          });
        }
      }

      await t.commit();
      return await this.findById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // --- EXCLUIR CONTA A RECEBER + PARCELAS ---
  async delete(id) {
    const t = await sequelize.transaction();

    try {
      const conta = await ContaReceber.findByPk(id);
      if (!conta) throw new Error('Conta a receber não encontrada');

      await ParcelaContaReceber.destroy({
        where: { conta_receber_id: id },
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

  // --- MARCAR UMA PARCELA COMO PAGA ---
  async marcarParcelaComoPaga(conta_id, parcela_id, data_pagamento = new Date()) {
    const parcela = await ParcelaContaReceber.findOne({
      where: { id: parcela_id, conta_receber_id: conta_id },
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

