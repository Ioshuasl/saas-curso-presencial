module.exports = {
  async up() {
    const { Tenant } = await import('../models/index.js');

    const tenants = [
      { nome: 'Barbearia Exemplo 1', slug: 'barbearia-exemplo-1', ativo: true },
      { nome: 'Barbearia Exemplo 2', slug: 'barbearia-exemplo-2', ativo: true },
    ];

    for (const t of tenants) {
      const existing = await Tenant.findOne({ where: { slug: t.slug } });
      if (!existing) {
        await Tenant.create(t);
      }
    }
  },

  async down() {
    // Intencional: down deixa controle de limpeza para o desenvolvedor.
  },
};

