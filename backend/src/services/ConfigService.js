import { Config } from '../models/index.js';

class ConfigService {
  async findByTenantId(tenantId) {
    const config = await Config.findOne({
      where: { tenant_id: tenantId },
    });
    if (!config) throw new Error('Config não encontrada para este tenant');
    return config;
  }

  /**
   * Atualiza o JSON `settings` com merge superficial.
   * Aceita `{ tema: 'escuro' }` ou `{ settings: { tema: 'escuro' } }`.
   */
  async updateByTenantId(tenantId, dados) {
    const partial =
      dados != null &&
      typeof dados.settings === 'object' &&
      dados.settings !== null &&
      !Array.isArray(dados.settings)
        ? dados.settings
        : dados;

    if (partial == null || typeof partial !== 'object' || Array.isArray(partial)) {
      throw new Error('Payload de configuração inválido: esperado um objeto.');
    }

    const config = await Config.findOne({
      where: { tenant_id: tenantId },
    });
    if (!config) throw new Error('Config não encontrada para este tenant');

    const atual = config.settings && typeof config.settings === 'object' && !Array.isArray(config.settings)
      ? config.settings
      : {};
    const proximo = { ...atual, ...partial };

    await config.update({ settings: proximo });
    return config;
  }
}

export default new ConfigService();
