import TenantService from '../services/TenantService.js';

class TenantController {
  async store(req, res) {
    try {
      const tenant = await TenantService.create(req.body);
      return res.status(201).json(tenant);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async index(req, res) {
    try {
      const resultado = await TenantService.findAll(
        req.query,
        req.tenantId,
        req.userRole,
      );
      return res.json(resultado);
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao buscar tenants' });
    }
  }

  async show(req, res) {
    try {
      const tenant = await TenantService.findById(
        req.params.id,
        req.tenantId,
        req.userRole,
      );
      return res.json(tenant);
    } catch (e) {
      return res.status(404).json({ error: e.message });
    }
  }

  async update(req, res) {
    try {
      const tenant = await TenantService.update(
        req.params.id,
        req.tenantId,
        req.userRole,
        req.body,
      );
      return res.json(tenant);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async delete(req, res) {
    try {
      await TenantService.delete(req.params.id, req.tenantId, req.userRole);
      return res.status(204).send();
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }
}

export default new TenantController();
