import bcrypt from 'bcrypt';
import { Usuario, PerfilAdministrador, PerfilAluno, Inscricao, QuestionarioInicial, FeedbackFinal, sequelize } from '../models/index.js';
import { gerarHash, compararHash, gerarToken } from '../utils/security.js';
import { Op } from 'sequelize';
import InscricaoService from '../services/InscricaoService.js';

class UsuarioService {

  // --- CREATE ---
  async createAdmin(dados) {
    const t = await sequelize.transaction();
    try {
      const senha_hash = await gerarHash(dados.senha);
      const usuario = await Usuario.create(
        { ...dados, senha_hash, role: 'ADMIN' },
        { transaction: t }
      );
      await PerfilAdministrador.create(
        { usuario_id: usuario.id, nome_completo: dados.nome_completo },
        { transaction: t }
      );
      await t.commit();
      return usuario;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async createAluno(dados) {
    const t = await sequelize.transaction();
    try {
      const senha_hash = await gerarHash(dados.senha);
      const usuario = await Usuario.create(
        { ...dados, senha_hash, role: 'ALUNO' },
        { transaction: t }
      );
      await PerfilAluno.create(
        { 
          usuario_id: usuario.id, 
          nome_completo: dados.nome_completo,
          telefone: dados.telefone,
          cidade: dados.cidade,
          profissao: dados.profissao,
          biografia: dados.biografia
        },
        { transaction: t }
      );
      await t.commit();
      return usuario;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // --- CREATE ALUNO + INSCRIÇÃO EM CURSO ---
  async createAlunoComInscricao(dados, curso_id) {
    const t = await sequelize.transaction();
    try {
      const senha_hash = await gerarHash(dados.senha);
      const usuario = await Usuario.create(
        { ...dados, senha_hash, role: 'ALUNO' },
        { transaction: t },
      );

      await PerfilAluno.create(
        {
          usuario_id: usuario.id,
          nome_completo: dados.nome_completo,
          telefone: dados.telefone,
          cidade: dados.cidade,
          profissao: dados.profissao,
          biografia: dados.biografia,
        },
        { transaction: t },
      );

      // Cria a inscrição do aluno no curso dentro da mesma transação
      await InscricaoService.create(usuario.id, curso_id, t);

      await t.commit();
      return usuario;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // --- READ (com filtros e paginação) ---
  async findAllAdmins(params = {}) {
    const {
      page = 1,
      limit = 10,
      username,
      email,
      nome,
      status,
      sort = 'id',
      order = 'DESC',
    } = params;

    const allowedSort = ['id', 'username', 'email', 'status', 'created_at', 'nome_completo'];
    const sortField = allowedSort.includes(sort) ? sort : 'id';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const where = { role: 'ADMIN' };
    if (username != null && String(username).trim() !== '') {
      where.username = { [Op.iLike]: `%${String(username).trim()}%` };
    }
    if (email != null && String(email).trim() !== '') {
      where.email = { [Op.iLike]: `%${String(email).trim()}%` };
    }
    if (status !== undefined && status !== '') {
      where.status = status === 'true' || status === true;
    }

    const include = {
      model: PerfilAdministrador,
      as: 'perfil_admin',
      attributes: ['usuario_id', 'nome_completo'],
    };
    if (nome != null && String(nome).trim() !== '') {
      include.where = { nome_completo: { [Op.iLike]: `%${String(nome).trim()}%` } };
      include.required = true;
    }

    const orderClause = sortField === 'nome_completo'
      ? [[{ model: PerfilAdministrador, as: 'perfil_admin' }, 'nome_completo', sortOrder]]
      : [[sortField, sortOrder]];

    const { count, rows } = await Usuario.findAndCountAll({
      where,
      include: [include],
      attributes: { exclude: ['senha_hash'] },
      order: orderClause,
      limit: limitNum,
      offset,
      distinct: true,
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

  async findAllAlunos(params = {}) {
    const {
      page = 1,
      limit = 10,
      username,
      email,
      nome,
      cidade,
      profissao,
      status,
      sort = 'id',
      order = 'DESC',
    } = params;

    const allowedSort = ['id', 'username', 'email', 'status', 'created_at', 'nome_completo', 'cidade', 'profissao'];
    const sortField = allowedSort.includes(sort) ? sort : 'id';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const where = { role: 'ALUNO' };
    if (username != null && String(username).trim() !== '') {
      where.username = { [Op.iLike]: `%${String(username).trim()}%` };
    }
    if (email != null && String(email).trim() !== '') {
      where.email = { [Op.iLike]: `%${String(email).trim()}%` };
    }
    if (status !== undefined && status !== '') {
      where.status = status === 'true' || status === true;
    }

    const include = {
      model: PerfilAluno,
      as: 'perfil_aluno',
      attributes: ['usuario_id', 'nome_completo', 'telefone', 'cidade', 'profissao', 'biografia'],
    };
    const perfilWhere = {};
    if (nome != null && String(nome).trim() !== '') {
      perfilWhere.nome_completo = { [Op.iLike]: `%${String(nome).trim()}%` };
    }
    if (cidade != null && String(cidade).trim() !== '') {
      perfilWhere.cidade = { [Op.iLike]: `%${String(cidade).trim()}%` };
    }
    if (profissao != null && String(profissao).trim() !== '') {
      perfilWhere.profissao = { [Op.iLike]: `%${String(profissao).trim()}%` };
    }
    if (Object.keys(perfilWhere).length > 0) {
      include.where = perfilWhere;
      include.required = true;
    }

    const orderClause = ['nome_completo', 'cidade', 'profissao'].includes(sortField)
      ? [[{ model: PerfilAluno, as: 'perfil_aluno' }, sortField, sortOrder]]
      : [[sortField, sortOrder]];

    const { count, rows } = await Usuario.findAndCountAll({
      where,
      include: [include],
      attributes: { exclude: ['senha_hash'] },
      order: orderClause,
      limit: limitNum,
      offset,
      distinct: true,
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

  async findAdminById(id) {
    return await Usuario.findOne({ 
      where: { id, role: 'ADMIN' }, 
      include: { model: PerfilAdministrador, as: 'perfil_admin' } 
    });
  }

  async findAlunoById(id) {
    return await Usuario.findOne({ 
      where: { id, role: 'ALUNO' }, 
      include: [
        { model: PerfilAluno, as: 'perfil_aluno' },
        {
          model: Inscricao,
          as: 'inscricoes',
          include: [
            { model: QuestionarioInicial, as: 'questionario_inicial' },
            { model: FeedbackFinal, as: 'feedback_final' },
          ],
        },
      ],
    });
  }

  // --- UPDATE ---
  async updateAdmin(id, dados) {
    const t = await sequelize.transaction();
    try {
      const usuario = await Usuario.findByPk(id);
      if (!usuario) throw new Error('Usuário não encontrado');

      if (dados.senha) dados.senha_hash = await gerarHash(dados.senha);
      
      await usuario.update(dados, { transaction: t });
      await PerfilAdministrador.update(dados, { where: { usuario_id: id }, transaction: t });
      
      await t.commit();
      return usuario;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async updateAluno(id, dados) {
    const t = await sequelize.transaction();
    try {
      const usuario = await Usuario.findByPk(id);
      if (!usuario) throw new Error('Usuário não encontrado');

      if (dados.senha) dados.senha_hash = await gerarHash(dados.senha);

      await usuario.update(dados, { transaction: t });
      await PerfilAluno.update(dados, { where: { usuario_id: id }, transaction: t });

      await t.commit();
      return usuario;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // --- DELETE ---
  async deleteUser(id) {
    // Como usamos onDelete: 'CASCADE', deletar o Usuario remove o Perfil automaticamente
    const usuario = await Usuario.findByPk(id);
    if (!usuario) throw new Error('Usuário não encontrado');
    return await usuario.destroy();
  }

  async login(identificador, senha) {
    // Busca flexível: o identificador pode ser username, email ou cpf
    const usuario = await Usuario.findOne({
      where: {
        [Op.or]: [
          { username: identificador },
          { email: identificador },
          { cpf: identificador }
        ]
      },
      // Incluímos os perfis para saber quem está logando
      include: [
        { model: PerfilAdministrador, as: 'perfil_admin' },
        { model: PerfilAluno, as: 'perfil_aluno' }
      ]
    });

    if (!usuario) throw new Error('Usuário não encontrado');
    if (!usuario.status) throw new Error('Usuário inativo');

    const senhaValida = await compararHash(senha, usuario.senha_hash);
    if (!senhaValida) throw new Error('Senha inválida');

    // Gerar o token com ID e Role
    const token = gerarToken({ id: usuario.id, role: usuario.role });

    return { usuario, token };
  }

  async getMe(id) {
    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['senha_hash'] }, // Segurança: nunca retorna a senha
      include: [
        { model: PerfilAdministrador, as: 'perfil_admin' },
        { model: PerfilAluno, as: 'perfil_aluno' }
      ]
    });
    
    if (!usuario) throw new Error('Usuário não encontrado');
    return usuario;
  }
}

export default new UsuarioService();