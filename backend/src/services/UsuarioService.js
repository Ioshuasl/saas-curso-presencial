import bcrypt from 'bcrypt';
import { Usuario, PerfilAdministrador, PerfilAluno, sequelize } from '../models/index.js';
import { gerarHash, compararHash, gerarToken } from '../utils/security.js';
import { Op } from 'sequelize';

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

  // --- READ ---
  async findAllAdmins() {
    return await Usuario.findAll({ 
      where: { role: 'ADMIN' }, 
      include: { model: PerfilAdministrador, as: 'perfil_admin' } 
    });
  }

  async findAllAlunos() {
    return await Usuario.findAll({ 
      where: { role: 'ALUNO' }, 
      include: { model: PerfilAluno, as: 'perfil_aluno' } 
    });
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
      include: { model: PerfilAluno, as: 'perfil_aluno' } 
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