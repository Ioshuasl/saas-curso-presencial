import ContaPagarService from '../services/ContaPagarService.js';
import { resolveTenantIdForAdminRequest } from '../utils/tenantAdminContext.js';

function resolveErrorStatus(error, fallbackStatus) {
  if (error?.message === 'tenantId não disponível no contexto autenticado') {
    return 401;
  }
  return fallbackStatus;
}

class ContaPagarController {
  async store(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req);
      const conta = await ContaPagarService.create(tenantId, req.body);
      return res.status(201).json(conta);
    } catch (e) {
      return res.status(resolveErrorStatus(e, 400)).json({ error: e.message });
    }
  }

  async index(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req);
      const resultado = await ContaPagarService.findAll(tenantId, req.query);
      return res.json(resultado);
    } catch (e) {
      return res
        .status(resolveErrorStatus(e, 500))
        .json({ error: e?.message || 'Erro ao buscar contas a pagar' });
    }
  }

  async show(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req);
      const conta = await ContaPagarService.findById(req.params.id, tenantId);
      return res.json(conta);
    } catch (e) {
      return res.status(resolveErrorStatus(e, 404)).json({ error: e.message });
    }
  }

  async update(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req);
      const conta = await ContaPagarService.update(req.params.id, tenantId, req.body);
      return res.json(conta);
    } catch (e) {
      return res.status(resolveErrorStatus(e, 400)).json({ error: e.message });
    }
  }

  async delete(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req);
      await ContaPagarService.delete(req.params.id, tenantId);
      return res.status(204).send();
    } catch (e) {
      return res.status(resolveErrorStatus(e, 400)).json({ error: e.message });
    }
  }
}

export default new ContaPagarController();
