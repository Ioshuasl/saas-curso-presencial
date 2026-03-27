module.exports = {
  async up() {
    const {
      Tenant,
      Usuario,
      Curso,
      ContaPagar,
      ContaReceber,
      ParcelaContaReceber,
    } = await import('../models/index.js');

    const tenants = [
      { slug: 'barbearia-exemplo-1' },
      { slug: 'barbearia-exemplo-2' },
    ];

    for (const t of tenants) {
      const tenant = await Tenant.findOne({ where: { slug: t.slug } });
      if (!tenant) continue;

      const aluno = await Usuario.findOne({
        where: { tenant_id: tenant.id, role: 'ALUNO', username: `aluno_${t.slug}` },
      });
      const curso = await Curso.findOne({
        where: { tenant_id: tenant.id, nome: `Curso ${t.slug}` },
      });

      if (!aluno || !curso) continue;

      // Conta a pagar (despesa vinculada ao curso)
      // Mantem 1 registro por tenant/cuso (idempotente) e seta valores padrao.
      let contaPagar = await ContaPagar.findOne({
        where: { tenant_id: tenant.id, curso_id: curso.id },
      });

      if (!contaPagar) {
        contaPagar = await ContaPagar.create({
          tenant_id: tenant.id,
          descricao: 'Material de consumo',
          categoria: 'Material',
          valor: '500.00',
          data_vencimento: '2026-06-15',
          data_pagamento: null,
          observacao: 'Seed para testes.',
          status: 'PENDENTE',
          curso_id: curso.id,
        });
      } else {
        await contaPagar.update({
          descricao: 'Material de consumo',
          categoria: 'Material',
          valor: '500.00',
          data_vencimento: '2026-06-15',
          data_pagamento: null,
          observacao: 'Seed para testes.',
          status: 'PENDENTE',
        });
      }

      // Conta a receber (receita vinculada ao curso e aluno)
      // Mantem valores iguais entre tenants para testar isolamento via tenant_id.
      let contaReceber = await ContaReceber.findOne({
        where: { tenant_id: tenant.id, aluno_id: aluno.id, curso_id: curso.id },
      });

      if (!contaReceber) {
        contaReceber = await ContaReceber.create({
          tenant_id: tenant.id,
          aluno_id: aluno.id,
          curso_id: curso.id,
          forma_pagamento: 'PIX',
          valor_total: '500.00',
          observacao: 'Seed para testes.',
        });
      } else {
        await contaReceber.update({
          forma_pagamento: 'PIX',
          valor_total: '500.00',
          observacao: 'Seed para testes.',
        });
      }

      let parcela = await ParcelaContaReceber.findOne({
        where: { tenant_id: tenant.id, conta_receber_id: contaReceber.id, numero_parcela: 1 },
      });

      if (!parcela) {
        parcela = await ParcelaContaReceber.create({
          tenant_id: tenant.id,
          conta_receber_id: contaReceber.id,
          numero_parcela: 1,
          valor: '500.00',
          data_vencimento: '2026-06-30',
          pago: false,
          data_pagamento: null,
        });
      } else {
        await parcela.update({
          valor: '500.00',
          data_vencimento: '2026-06-30',
          pago: false,
          data_pagamento: null,
        });
      }
    }
  },

  async down() {},
};

