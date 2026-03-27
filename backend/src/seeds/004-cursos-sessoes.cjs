module.exports = {
  async up() {
    const { Tenant, Curso, SessaoCurso } = await import('../models/index.js');

    const tenants = [
      { slug: 'barbearia-exemplo-1' },
      { slug: 'barbearia-exemplo-2' },
    ];

    // Datas alinhadas com requests comuns de teste (ex.: /cursos/por-data?data=2026-05-10)
    const datas = ['2026-05-10', '2026-05-11'];
    const baseHorarioInicio = '08:00:00';
    const baseHorarioFim = '12:00:00';

    for (const t of tenants) {
      const tenant = await Tenant.findOne({ where: { slug: t.slug } });
      if (!tenant) continue;

      const cursoNome = `Curso ${t.slug}`;
      const existingCurso = await Curso.findOne({
        where: { tenant_id: tenant.id, nome: cursoNome },
      });

      let curso = existingCurso;
      if (!curso) {
        curso = await Curso.create({
          tenant_id: tenant.id,
          nome: cursoNome,
          ministrante: `Ministrante ${t.slug}`,
          descricao: `Curso de seed para ${t.slug}`,
          conteudo: 'Conteudo para testes.',
          valor: '100.00',
          vagas: 10,
          local: 'Sala 1',
          status: true,
          url_imagem: null,
        });
      }

      for (const data of datas) {
        const existingSessao = await SessaoCurso.findOne({
          where: {
            tenant_id: tenant.id,
            curso_id: curso.id,
            data,
            horario_inicio: baseHorarioInicio,
          },
        });

        if (!existingSessao) {
          await SessaoCurso.create({
            tenant_id: tenant.id,
            curso_id: curso.id,
            data,
            horario_inicio: baseHorarioInicio,
            horario_fim: baseHorarioFim,
          });
        }
      }
    }
  },

  async down() {},
};

