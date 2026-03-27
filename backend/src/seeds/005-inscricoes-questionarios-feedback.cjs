module.exports = {
  async up() {
    const {
      Tenant,
      Usuario,
      Curso,
      Inscricao,
      QuestionarioInicial,
      FeedbackFinal,
    } = await import('../models/index.js');

    const tenants = [
      { slug: 'barbearia-exemplo-1' },
      { slug: 'barbearia-exemplo-2' },
    ];

    for (const t of tenants) {
      const tenant = await Tenant.findOne({ where: { slug: t.slug } });
      if (!tenant) continue;

      const alunoUsername = `aluno_${t.slug}`;
      const aluno = await Usuario.findOne({
        where: { tenant_id: tenant.id, username: alunoUsername, role: 'ALUNO' },
      });
      if (!aluno) continue;

      const cursoNome = `Curso ${t.slug}`;
      const curso = await Curso.findOne({
        where: { tenant_id: tenant.id, nome: cursoNome },
      });
      if (!curso) continue;

      const existingInscricao = await Inscricao.findOne({
        where: { tenant_id: tenant.id, aluno_id: aluno.id, curso_id: curso.id },
      });

      let inscricao = existingInscricao;
      if (!inscricao) {
        inscricao = await Inscricao.create({
          tenant_id: tenant.id,
          aluno_id: aluno.id,
          curso_id: curso.id,
          presenca_confirmada: false,
          data_inscricao: new Date(),
        });
      }

      const existingQuestionario = await QuestionarioInicial.findOne({
        where: { tenant_id: tenant.id, inscricao_id: inscricao.id },
      });

      if (!existingQuestionario) {
        await QuestionarioInicial.create({
          tenant_id: tenant.id,
          inscricao_id: inscricao.id,
          maior_dor_inicio: 'Dificuldade com atendimento e agenda.',
          principal_expectativa: 'Organizar processos e aumentar conversões.',
        });
      }

      const existingFeedback = await FeedbackFinal.findOne({
        where: { tenant_id: tenant.id, inscricao_id: inscricao.id },
      });

      if (!existingFeedback) {
        await FeedbackFinal.create({
          tenant_id: tenant.id,
          inscricao_id: inscricao.id,
          objetivo_atingido: 'Consegui padronizar meu atendimento.',
          resultado_esperado: 'Mais clientes e menos retrabalho.',
          avaliacao: 4,
        });
      }
    }
  },

  async down() {},
};

