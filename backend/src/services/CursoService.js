import { Curso, SessaoCurso, Inscricao, sequelize } from '../models/index.js';

class CursoService {
  // --- CADASTRAR CURSO ---
  async create(dados) {
    const t = await sequelize.transaction();
    try {
      // Cria o curso base
      const curso = await Curso.create(dados, { transaction: t });

      // Se houver sessões no envio, cria-as vinculadas ao curso
      if (dados.sessoes && dados.sessoes.length > 0) {
        const sessoesComId = dados.sessoes.map(sessao => ({
          ...sessao,
          curso_id: curso.id
        }));
        await SessaoCurso.bulkCreate(sessoesComId, { transaction: t });
      }

      await t.commit();
      // Retorna o curso com as sessões incluídas (se houver)
      return await Curso.findByPk(curso.id, { include: ['sessoes'] });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // --- LISTAR TODOS ---
  async findAll() {
    return await Curso.findAll({
      order: [['id', 'DESC']]
    });
  }

  // --- LISTAR CURSOS POR DATA DE SESSÃO ---
  async findBySessionDate(data) {
    return await Curso.findAll({
      include: [
        {
          model: SessaoCurso,
          as: 'sessoes',
          where: { data },
          required: true, // Garante apenas cursos que tenham sessão na data informada
        },
      ],
      order: [['id', 'DESC']],
    });
  }

  // --- BUSCAR POR ID ---
  async findById(id) {
    const curso = await Curso.findByPk(id, {
      include: [{ model: SessaoCurso, as: 'sessoes' }]
    });
    if (!curso) throw new Error('Curso não encontrado');
    return curso;
  }

  // --- ATUALIZAR CURSO E SESSÕES ---
  async update(id, dados) {
    const t = await sequelize.transaction();
    try {
      const curso = await Curso.findByPk(id);
      if (!curso) throw new Error('Curso não encontrado');

      // Atualiza os dados básicos do curso
      await curso.update(dados, { transaction: t });

      // Se o array de sessões for enviado, substituímos as antigas pelas novas
      // Isso é mais seguro para garantir que o cronograma esteja exato
      if (dados.sessoes) {
        // Remove sessões antigas
        await SessaoCurso.destroy({ where: { curso_id: id }, transaction: t });
        
        // Cria as novas sessões
        const sessoesNovas = dados.sessoes.map(sessao => ({
          ...sessao,
          curso_id: id
        }));
        await SessaoCurso.bulkCreate(sessoesNovas, { transaction: t });
      }

      await t.commit();
      return await this.findById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // --- EXCLUIR CURSO ---
  async delete(id) {
    const curso = await Curso.findByPk(id);
    if (!curso) throw new Error('Curso não encontrado');

    // Como definimos os relacionamentos corretamente, 
    // o Sequelize cuidará da exclusão em cascata das sessões se configurado,
    // ou podemos garantir manualmente:
    const t = await sequelize.transaction();
    try {
      await SessaoCurso.destroy({ where: { curso_id: id }, transaction: t });
      await curso.destroy({ transaction: t });
      await t.commit();
      return true;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getVagasInfo(cursoId) {
    const curso = await Curso.findByPk(cursoId, {
      attributes: ['id', 'vagas'] // Só precisamos do limite total
    });

    if (!curso) throw new Error('Curso não encontrado');

    // Conta quantos registros existem na tabela de inscrições para este curso
    const vagasPreenchidas = await Inscricao.count({
      where: { curso_id: cursoId }
    });

    const vagasTotais = curso.vagas;
    const vagasDisponiveis = vagasTotais - vagasPreenchidas;

    return {
      vagas_totais: vagasTotais,
      vagas_preenchidas: vagasPreenchidas,
      vagas_disponiveis: Math.max(0, vagasDisponiveis), // Garante que não retorne número negativo
      tem_vaga: vagasDisponiveis > 0
    };
  }
}

export default new CursoService();