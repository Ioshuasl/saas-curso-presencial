import ConfigService from '../services/ConfigService.js';

function parseTenantId(param) {
  const id = parseInt(param, 10);
  if (Number.isNaN(id) || id < 1) return null;
  return id;
}

class ConfigController {
  async show(req, res) {
    const tenantId = parseTenantId(req.params.tenantId);
    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId inválido' });
    }
    if (req.userRole !== 'SAAS_ADMIN' && tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'Acesso negado a configuração de outro tenant' });
    }
    try {
      const config = await ConfigService.findByTenantId(tenantId);
      return res.json(config);
    } catch (e) {
      return res.status(404).json({ error: e.message });
    }
  }

  async update(req, res) {
    const tenantId = parseTenantId(req.params.tenantId);
    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId inválido' });
    }
    if (req.userRole !== 'SAAS_ADMIN' && tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'Acesso negado a configuração de outro tenant' });
    }
    try {
      const config = await ConfigService.updateByTenantId(tenantId, req.body);
      return res.json(config);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }
}

export default new ConfigController();
