import UsuarioService from '../services/UsuarioService.js';

class UsuarioController {
  async storeAdmin(req, res) {
    try {
      const user = await UsuarioService.createAdmin(req.body);
      return res.status(201).json(user);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async storeAluno(req, res) {
    try {
      const user = await UsuarioService.createAluno(req.body);
      return res.status(201).json(user);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async indexAdmin(req, res) {
    const users = await UsuarioService.findAllAdmins();
    return res.json(users);
  }

  async indexAluno(req, res) {
    const users = await UsuarioService.findAllAlunos();
    return res.json(users);
  }

  async showAdmin(req, res) {
    const user = await UsuarioService.findAdminById(req.params.id);
    return user ? res.json(user) : res.status(404).json({ error: 'Não encontrado' });
  }

  async showAluno(req, res) {
    const user = await UsuarioService.findAlunoById(req.params.id);
    return user ? res.json(user) : res.status(404).json({ error: 'Não encontrado' });
  }

  async updateAdmin(req, res) {
    try {
      const user = await UsuarioService.updateAdmin(req.params.id, req.body);
      return res.json(user);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async updateAluno(req, res) {
    try {
      const user = await UsuarioService.updateAluno(req.params.id, req.body);
      return res.json(user);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async delete(req, res) {
    try {
      await UsuarioService.deleteUser(req.params.id);
      return res.status(204).send();
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async login(req, res) {
    try {
      const { identificador, senha } = req.body; // identificador = email, cpf ou username
      const { usuario, token } = await UsuarioService.login(identificador, senha);
      
      return res.json({ usuario, token });
    } catch (e) {
      return res.status(401).json({ error: e.message });
    }
  }

  async logout(req, res) {
    // No JWT, o logout é feito no cliente (deletando o token). 
    // No servidor, apenas retornamos sucesso.
    return res.status(200).json({ message: 'Logout realizado com sucesso. Remova o token do cliente.' });
  }

  async me(req, res) {
    try {
      // O 'req.userId' virá de um middleware de autenticação que faremos a seguir
      const user = await UsuarioService.getMe(req.userId);
      return res.json(user);
    } catch (e) {
      return res.status(404).json({ error: e.message });
    }
  }
}

export default new UsuarioController();