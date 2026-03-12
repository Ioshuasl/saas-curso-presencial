import ContaPagarService from '../services/ContaPagarService.js';

class ContaPagarController {
  // --- CRIAR CONTA A PAGAR ---
  async store(req, res) {
    try {
      const conta = await ContaPagarService.create(req.body);
      return res.status(201).json(conta);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  // --- LISTAR CONTAS A PAGAR (com filtros e paginação) ---
  async index(req, res) {
    try {
      const resultado = await ContaPagarService.findAll(req.query);
      return res.json(resultado);
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao buscar contas a pagar' });
    }
  }

  // --- BUSCAR CONTA A PAGAR POR ID ---
  async show(req, res) {
    try {
      const conta = await ContaPagarService.findById(req.params.id);
      return res.json(conta);
    } catch (e) {
      return res.status(404).json({ error: e.message });
    }
  }

  // --- ATUALIZAR CONTA A PAGAR ---
  async update(req, res) {
    try {
      const conta = await ContaPagarService.update(req.params.id, req.body);
      return res.json(conta);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  // --- EXCLUIR CONTA A PAGAR ---
  async delete(req, res) {
    try {
      await ContaPagarService.delete(req.params.id);
      return res.status(204).send();
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }
}

export default new ContaPagarController();

