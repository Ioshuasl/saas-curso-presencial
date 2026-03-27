module.exports = {
  async up() {
    const {
      Tenant,
      Usuario,
      PerfilAdministrador,
      PerfilAluno,
      sequelize,
    } = await import('../models/index.js');

    const { gerarHash } = await import('../utils/security.js');

    const tenants = [
      { slug: 'barbearia-exemplo-1', nome: 'Barbearia Exemplo 1' },
      { slug: 'barbearia-exemplo-2', nome: 'Barbearia Exemplo 2' },
    ];

    const senhaSeed = '123456';

    // Garantia de compatibilidade com Postgres enums:
    // o modelo passou a aceitar `SAAS_ADMIN`, mas o enum no banco pode ainda não conter esse label.
    // Em desenvolvimento, `sync({ alter: true })` ajuda, mas não é 100% em enums; então usamos fallback via SQL.
    await sequelize.sync({ alter: true });
    await sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_enum
          WHERE enumlabel = 'SAAS_ADMIN'
            AND enumtypid = 'enum_usuarios_role'::regtype
        ) THEN
          ALTER TYPE enum_usuarios_role ADD VALUE 'SAAS_ADMIN';
        END IF;
      END
      $$;
    `);

    for (const t of tenants) {
      const tenant = await Tenant.findOne({ where: { slug: t.slug } });
      if (!tenant) continue;

      // SAAS_ADMIN: criar 1 registro por tenant para permitir login condicionando por tenant_slug.
      const saasAdminUsername = 'saas_admin';
      const saasAdminExisting = await Usuario.findOne({
        where: { tenant_id: tenant.id, username: saasAdminUsername },
      });

      if (!saasAdminExisting) {
        const senha_hash = await gerarHash(senhaSeed);
        const saasAdmin = await Usuario.create({
          tenant_id: tenant.id,
          username: saasAdminUsername,
          email: `saas_admin_${t.slug}@local.test`,
          cpf: t.slug.endsWith('2') ? '00011122244' : '00011122233',
          senha_hash,
          role: 'SAAS_ADMIN',
          status: true,
        });

        await PerfilAdministrador.create({
          usuario_id: saasAdmin.id,
          tenant_id: tenant.id,
          nome_completo: 'Admin do SaaS',
        });
      }

      // ADMIN do tenant
      const adminUsername = `admin_${t.slug}`;
      const admin = await Usuario.findOne({
        where: { tenant_id: tenant.id, username: adminUsername },
      });

      if (!admin) {
        const senha_hash = await gerarHash(senhaSeed);
        const usuarioAdmin = await Usuario.create({
          tenant_id: tenant.id,
          username: adminUsername,
          email: `admin_${t.slug}@local.test`,
          cpf: t.slug.endsWith('2') ? '11122233344' : '11122233333',
          senha_hash,
          role: 'ADMIN',
          status: true,
        });

        await PerfilAdministrador.create({
          usuario_id: usuarioAdmin.id,
          tenant_id: tenant.id,
          nome_completo: `Admin ${t.nome}`,
        });
      }

      // ALUNO do tenant
      const alunoUsername = `aluno_${t.slug}`;
      const aluno = await Usuario.findOne({
        where: { tenant_id: tenant.id, username: alunoUsername },
      });

      if (!aluno) {
        const senha_hash = await gerarHash(senhaSeed);
        const usuarioAluno = await Usuario.create({
          tenant_id: tenant.id,
          username: alunoUsername,
          email: `aluno_${t.slug}@local.test`,
          cpf: t.slug.endsWith('2') ? '22233344455' : '22233344466',
          senha_hash,
          role: 'ALUNO',
          status: true,
        });

        await PerfilAluno.create({
          usuario_id: usuarioAluno.id,
          tenant_id: tenant.id,
          nome_completo: `Aluno ${t.nome}`,
          telefone: '62999998888',
          cidade: 'Goiânia',
          profissao: 'Barbeiro',
          biografia: 'Seed para testes multi-tenant.',
        });
      }
    }
  },

  async down() {},
};

