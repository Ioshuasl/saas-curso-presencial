import ContaReceberService from '../services/ContaReceberService.js';
import { resolveTenantIdForAdminRequest } from '../utils/tenantAdminContext.js';

function resolveErrorStatus(error, fallbackStatus) {
  if (error?.message === 'tenantId não disponível no contexto autenticado') {
    return 401;
  }
  return fallbackStatus;
}

class ContaReceberController {
  async store(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req);
      const conta = await ContaReceberService.create(tenantId, req.body);
      return res.status(201).json(conta);
    } catch (e) {
      return res.status(resolveErrorStatus(e, 400)).json({ error: e.message });
    }
  }

  async index(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req);
      const resultado = await ContaReceberService.findAll(tenantId, req.query);
      return res.json(resultado);
    } catch (e) {
      return res
        .status(resolveErrorStatus(e, 500))
        .json({ error: e?.message || 'Erro ao buscar contas a receber' });
    }
  }

  async show(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req);
      const conta = await ContaReceberService.findById(req.params.id, tenantId);
      return res.json(conta);
    } catch (e) {
      return res.status(resolveErrorStatus(e, 404)).json({ error: e.message });
    }
  }

  async update(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req);
      const conta = await ContaReceberService.update(req.params.id, tenantId, req.body);
      return res.json(conta);
    } catch (e) {
      return res.status(resolveErrorStatus(e, 400)).json({ error: e.message });
    }
  }

  async delete(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req);
      await ContaReceberService.delete(req.params.id, tenantId);
      return res.status(204).send();
    } catch (e) {
      return res.status(resolveErrorStatus(e, 400)).json({ error: e.message });
    }
  }

  async marcarParcelaComoPaga(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req);
      const { id, parcela_id } = req.params;
      const { data_pagamento } = req.body;

      const parcela = await ContaReceberService.marcarParcelaComoPaga(
        id,
        parcela_id,
        tenantId,
        data_pagamento ? new Date(data_pagamento) : new Date(),
      );

      return res.json(parcela);
    } catch (e) {
      return res.status(resolveErrorStatus(e, 400)).json({ error: e.message });
    }
  }
}

export default new ContaReceberController();
