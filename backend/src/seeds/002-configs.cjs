module.exports = {
  async up() {
    const { Tenant, Config } = await import('../models/index.js');

    const tenants = [
      { slug: 'barbearia-exemplo-1', settings: { tema: 'escuro' } },
      { slug: 'barbearia-exemplo-2', settings: { tema: 'claro' } },
    ];

    for (const t of tenants) {
      const tenant = await Tenant.findOne({ where: { slug: t.slug } });
      if (!tenant) continue;

      const existing = await Config.findOne({ where: { tenant_id: tenant.id } });
      if (!existing) {
        await Config.create({ tenant_id: tenant.id, settings: t.settings ?? {} });
      }
    }
  },

  async down() {},
};

