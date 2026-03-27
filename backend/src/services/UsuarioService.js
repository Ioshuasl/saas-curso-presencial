import { Usuario, PerfilAdministrador, PerfilAluno, Inscricao, QuestionarioInicial, FeedbackFinal, Curso, SessaoCurso, sequelize } from '../models/index.js';
import { gerarHash, compararHash, gerarToken } from '../utils/security.js';
import { resolveTenantId, omitTenantContext } from '../utils/tenantContext.js';
import { mergeTenantWhere, requireTenantId } from '../utils/tenantScope.js';
import { Op, literal } from 'sequelize';
import InscricaoService from '../services/InscricaoService.js';

class UsuarioService {

  // --- CREATE ---
  async createAdmin(tenantId, dados) {
    const tenant_id = requireTenantId(tenantId);
    const t = await sequelize.transaction();
    try {
      const clean = omitTenantContext(dados);
      const { nome_completo, senha, ...usuarioFields } = clean;
      const senha_hash = await gerarHash(senha);
      const usuario = await Usuario.create(
        { ...usuarioFields, senha_hash, role: 'ADMIN', tenant_id },
        { transaction: t }
      );
      await PerfilAdministrador.create(
        { usuario_id: usuario.id, nome_completo, tenant_id },
        { transaction: t }
      );
      await t.commit();
      return usuario;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async createAluno(tenantId, dados) {
    const tenant_id = requireTenantId(tenantId);
    const t = await sequelize.transaction();
    try {
      const clean = omitTenantContext(dados);
      const {
        nome_completo,
        senha,
        telefone,
        cidade,
        profissao,
        biografia,
        curso_id,
        ...usuarioFields
      } = clean;
      const senha_hash = await gerarHash(senha);
      const usuario = await Usuario.create(
        { ...usuarioFields, senha_hash, role: 'ALUNO', tenant_id },
        { transaction: t }
      );
      await PerfilAluno.create(
        {
          usuario_id: usuario.id,
          nome_completo,
          telefone,
          cidade,
          profissao,
          biografia,
          tenant_id,
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
  async createAlunoComInscricao(tenantId, dados, curso_id) {
    const tenant_id = requireTenantId(tenantId);
    const t = await sequelize.transaction();
    try {
      const curso = await Curso.findByPk(curso_id, { transaction: t });
      if (!curso) throw new Error('Curso não encontrado');
      if (Number(curso.tenant_id) !== Number(tenant_id)) {
        throw new Error('Curso não pertence ao tenant informado');
      }

      const clean = omitTenantContext(dados);
      const {
        nome_completo,
        senha,
        telefone,
        cidade,
        profissao,
        biografia,
        curso_id: _ignore,
        ...usuarioFields
      } = clean;
      const senha_hash = await gerarHash(senha);
      const usuario = await Usuario.create(
        { ...usuarioFields, senha_hash, role: 'ALUNO', tenant_id },
        { transaction: t },
      );

      await PerfilAluno.create(
        {
          usuario_id: usuario.id,
          nome_completo,
          telefone,
          cidade,
          profissao,
          biografia,
          tenant_id,
        },
        { transaction: t },
      );

      await InscricaoService.create(usuario.id, curso_id, t, tenant_id);

      await t.commit();
      return usuario;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // --- READ (com filtros e paginação) ---
  async findAllAdmins(tenantId, params = {}) {
    const tid = requireTenantId(tenantId);
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

    const extra = { role: 'ADMIN' };
    if (username != null && String(username).trim() !== '') {
      extra.username = { [Op.iLike]: `%${String(username).trim()}%` };
    }
    if (email != null && String(email).trim() !== '') {
      extra.email = { [Op.iLike]: `%${String(email).trim()}%` };
    }
    if (status !== undefined && status !== '') {
      extra.status = status === 'true' || status === true;
    }

    const where = mergeTenantWhere(tid, extra);

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

  async findAllAlunos(tenantId, params = {}) {
    const tid = requireTenantId(tenantId);
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

    const extra = { role: 'ALUNO' };
    if (username != null && String(username).trim() !== '') {
      extra.username = { [Op.iLike]: `%${String(username).trim()}%` };
    }
    if (email != null && String(email).trim() !== '') {
      extra.email = { [Op.iLike]: `%${String(email).trim()}%` };
    }
    if (status !== undefined && status !== '') {
      extra.status = status === 'true' || status === true;
    }

    const where = mergeTenantWhere(tid, extra);

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
      attributes: {
        exclude: ['senha_hash'],
        include: [
          [
            literal(`(
              SELECT COUNT(DISTINCT i.curso_id)
              FROM inscricoes i
              WHERE i.aluno_id = "Usuario"."id"
                AND i.tenant_id = ${Number(tid)}
            )`),
            'total_cursos_inscritos',
          ],
        ],
      },
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

  async findAdminById(id, tenantId) {
    const tid = requireTenantId(tenantId);
    return await Usuario.findOne({
      where: mergeTenantWhere(tid, { id, role: 'ADMIN' }),
      include: { model: PerfilAdministrador, as: 'perfil_admin' },
    });
  }

  async findAlunoById(id, tenantId) {
    const tid = requireTenantId(tenantId);
    return await Usuario.findOne({
      where: mergeTenantWhere(tid, { id, role: 'ALUNO' }),
      attributes: { exclude: ['senha_hash'] },
      include: [
        { model: PerfilAluno, as: 'perfil_aluno' },
        {
          model: Inscricao,
          as: 'inscricoes',
          where: { tenant_id: tid },
          required: false,
          include: [
            {
              model: Curso,
              as: 'curso',
              where: { tenant_id: tid },
              required: false,
              include: [
                {
                  model: SessaoCurso,
                  as: 'sessoes',
                  where: { tenant_id: tid },
                  required: false,
                },
              ],
            },
            {
              model: QuestionarioInicial,
              as: 'questionario_inicial',
              where: { tenant_id: tid },
              required: false,
            },
            {
              model: FeedbackFinal,
              as: 'feedback_final',
              where: { tenant_id: tid },
              required: false,
            },
          ],
        },
      ],
    });
  }

  // --- UPDATE ---
  async updateAdmin(id, tenantId, dados) {
    const tid = requireTenantId(tenantId);
    const t = await sequelize.transaction();
    try {
      const usuario = await Usuario.findOne({
        where: mergeTenantWhere(tid, { id }),
        transaction: t,
      });
      if (!usuario) throw new Error('Usuário não encontrado');

      const dadosUsuario = {};
      const dadosPerfil = {};

      if (dados.username !== undefined) dadosUsuario.username = dados.username;
      if (dados.email !== undefined) dadosUsuario.email = dados.email;
      if (dados.cpf !== undefined) dadosUsuario.cpf = dados.cpf;
      if (dados.status !== undefined) dadosUsuario.status = dados.status;
      if (dados.senha) dadosUsuario.senha_hash = await gerarHash(dados.senha);
      if (dados.nome_completo !== undefined) dadosPerfil.nome_completo = dados.nome_completo;

      if (Object.keys(dadosUsuario).length > 0) {
        await usuario.update(dadosUsuario, { transaction: t });
      }
      if (Object.keys(dadosPerfil).length > 0) {
        await PerfilAdministrador.update(dadosPerfil, { where: { usuario_id: id }, transaction: t });
      }
      
      await t.commit();
      return this.findAdminById(id, tid);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async updateAluno(id, tenantId, dados) {
    const tid = requireTenantId(tenantId);
    const t = await sequelize.transaction();
    try {
      const usuario = await Usuario.findOne({
        where: mergeTenantWhere(tid, { id }),
        transaction: t,
      });
      if (!usuario) throw new Error('Usuário não encontrado');

      const dadosUsuario = {};
      const dadosPerfil = {};

      if (dados.username !== undefined) dadosUsuario.username = dados.username;
      if (dados.email !== undefined) dadosUsuario.email = dados.email;
      if (dados.cpf !== undefined) dadosUsuario.cpf = dados.cpf;
      if (dados.status !== undefined) dadosUsuario.status = dados.status;
      if (dados.senha) dadosUsuario.senha_hash = await gerarHash(dados.senha);

      if (dados.nome_completo !== undefined) dadosPerfil.nome_completo = dados.nome_completo;
      if (dados.telefone !== undefined) dadosPerfil.telefone = dados.telefone;
      if (dados.cidade !== undefined) dadosPerfil.cidade = dados.cidade;
      if (dados.profissao !== undefined) dadosPerfil.profissao = dados.profissao;
      if (dados.biografia !== undefined) dadosPerfil.biografia = dados.biografia;

      if (Object.keys(dadosUsuario).length > 0) {
        await usuario.update(dadosUsuario, { transaction: t });
      }
      if (Object.keys(dadosPerfil).length > 0) {
        await PerfilAluno.update(dadosPerfil, { where: { usuario_id: id }, transaction: t });
      }

      await t.commit();
      return this.findAlunoById(id, tid);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // --- DELETE ---
  async deleteUser(id, tenantId) {
    const tid = requireTenantId(tenantId);
    const usuario = await Usuario.findOne({ where: mergeTenantWhere(tid, { id }) });
    if (!usuario) throw new Error('Usuário não encontrado');
    return await usuario.destroy();
  }

  async login(identificador, senha, tenantCtx = {}) {
    const tenant_id = await resolveTenantId(tenantCtx);

    const usuario = await Usuario.findOne({
      where: {
        tenant_id,
        [Op.or]: [
          { username: identificador },
          { email: identificador },
          { cpf: identificador },
        ],
      },
      include: [
        { model: PerfilAdministrador, as: 'perfil_admin' },
        { model: PerfilAluno, as: 'perfil_aluno' },
      ],
    });

    if (!usuario) throw new Error('Usuário não encontrado');
    if (!usuario.status) throw new Error('Usuário inativo');

    const senhaValida = await compararHash(senha, usuario.senha_hash);
    if (!senhaValida) throw new Error('Senha inválida');

    const token = gerarToken({
      id: usuario.id,
      role: usuario.role,
      tenant_id: usuario.tenant_id,
    });

    return { usuario, token };
  }

  async getMe(id, tenantId) {
    const tid = requireTenantId(tenantId);
    const usuario = await Usuario.findOne({
      where: mergeTenantWhere(tid, { id }),
      attributes: { exclude: ['senha_hash'] },
      include: [
        { model: PerfilAdministrador, as: 'perfil_admin' },
        { model: PerfilAluno, as: 'perfil_aluno' },
      ],
    });

    if (!usuario) throw new Error('Usuário não encontrado');
    return usuario;
  }
}

export default new UsuarioService();