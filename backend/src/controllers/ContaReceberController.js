import ContaReceberService from '../services/ContaReceberService.js';

class ContaReceberController {
  // --- CRIAR CONTA A RECEBER + PARCELAS ---
  async store(req, res) {
    try {
      const conta = await ContaReceberService.create(req.body);
      return res.status(201).json(conta);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  // --- LISTAR CONTAS A RECEBER (com filtros e paginação) ---
  async index(req, res) {
    try {
      const resultado = await ContaReceberService.findAll(req.query);
      return res.json(resultado);
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao buscar contas a receber' });
    }
  }

  // --- BUSCAR CONTA A RECEBER POR ID ---
  async show(req, res) {
    try {
      const conta = await ContaReceberService.findById(req.params.id);
      return res.json(conta);
    } catch (e) {
      return res.status(404).json({ error: e.message });
    }
  }

  // --- ATUALIZAR CONTA A RECEBER E PARCELAS ---
  async update(req, res) {
    try {
      const conta = await ContaReceberService.update(req.params.id, req.body);
      return res.json(conta);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  // --- EXCLUIR CONTA A RECEBER ---
  async delete(req, res) {
    try {
      await ContaReceberService.delete(req.params.id);
      return res.status(204).send();
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  // --- MARCAR PARCELA COMO PAGA ---
  async marcarParcelaComoPaga(req, res) {
    try {
      const { id, parcela_id } = req.params;
      const { data_pagamento } = req.body;

      const parcela = await ContaReceberService.marcarParcelaComoPaga(
        id,
        parcela_id,
        data_pagamento ? new Date(data_pagamento) : new Date(),
      );

      return res.json(parcela);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }
}

export default new ContaReceberController();

