import fs from 'fs/promises';
import path from 'path';
import { Curso, SessaoCurso, Inscricao, Usuario, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import { UPLOADS_PATH } from '../middlewares/upload.js';

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

  // --- LISTAR COM FILTROS E PAGINAÇÃO ---
  async findAll(params = {}) {
    const {
      page = 1,
      limit = 10,
      nome,
      ministrante,
      status,
      sort = 'id',
      order = 'DESC',
    } = params;

    const allowedSort = ['id', 'nome', 'ministrante', 'valor', 'vagas', 'local', 'status', 'created_at'];
    const sortField = allowedSort.includes(sort) ? sort : 'id';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const where = {};

    if (nome != null && String(nome).trim() !== '') {
      where.nome = { [Op.iLike]: `%${String(nome).trim()}%` };
    }
    if (ministrante != null && String(ministrante).trim() !== '') {
      where.ministrante = { [Op.iLike]: `%${String(ministrante).trim()}%` };
    }
    if (status !== undefined && status !== '') {
      where.status = status === 'true' || status === true;
    }

    const { count, rows } = await Curso.findAndCountAll({
      where: Object.keys(where).length ? where : undefined,
      order: [[sortField, sortOrder]],
      limit: limitNum,
      offset,
    });

    const totalPaginas = Math.ceil(count / limitNum) || 1;

    return {
      data: rows,
      paginacao: {
        total: count,
        total_paginas: totalPaginas,
        pagina: pageNum,
        por_pagina: limitNum,
      },
    };
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

    const t = await sequelize.transaction();
    try {
      // Remove o arquivo de imagem em backend/uploads se existir
      if (curso.url_imagem && curso.url_imagem.startsWith('/api/uploads/')) {
        const filename = path.basename(curso.url_imagem);
        const filePath = path.join(UPLOADS_PATH, filename);
        await fs.unlink(filePath).catch((err) => {
          if (err.code !== 'ENOENT') throw err;
        });
      }

      await SessaoCurso.destroy({ where: { curso_id: id }, transaction: t });
      await curso.destroy({ transaction: t });
      await t.commit();
      return true;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // --- CURSOS VINCULADOS AO ALUNO (inscrições do aluno) ---
  async findCursosByAlunoId(aluno_id) {
    return await Curso.findAll({
      include: [
        { model: SessaoCurso, as: 'sessoes' },
        {
          model: Usuario,
          as: 'alunos_inscritos',
          where: { id: aluno_id },
          required: true,
          attributes: [],
          through: { attributes: ['data_inscricao'] },
        },
      ],
      order: [['id', 'DESC']],
    });
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