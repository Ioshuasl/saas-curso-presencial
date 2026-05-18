import UsuarioService from '../services/UsuarioService.js';
import { resolveTenantIdForAdminRequest } from '../utils/tenantAdminContext.js';

class UsuarioController {
  async storeSaasAdmin(req, res) {
    try {
      const user = await UsuarioService.createSaasAdmin(req.tenantId, req.userRole, req.body);
      return res.status(201).json(user);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async storeAdmin(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req);
      const user = await UsuarioService.createAdmin(tenantId, req.body);
      return res.status(201).json(user);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async storeAluno(req, res) {
    try {
      const { curso_id, ...dados } = req.body;
      const tenantId = await resolveTenantIdForAdminRequest(req);

      const user = curso_id
        ? await UsuarioService.createAlunoComInscricao(tenantId, dados, curso_id)
        : await UsuarioService.createAluno(tenantId, dados);
      return res.status(201).json(user);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async storeAlunoPublic(req, res) {
    try {
      const { curso_id, tenant_id, tenant_slug, ...dados } = req.body;
      const { usuario, token } = await UsuarioService.registerAlunoPublic(
        { tenant_id, tenant_slug },
        dados,
        curso_id,
      );
      return res.status(201).json({ usuario, token });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async indexAdmin(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req);
      const resultado = await UsuarioService.findAllAdmins(tenantId, req.query);
      return res.json(resultado);
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao buscar administradores' });
    }
  }

  async indexSaasAdmin(req, res) {
    try {
      const resultado = await UsuarioService.findAllSaasAdmins(req.query, req.userRole);
      return res.json(resultado);
    } catch (e) {
      return res.status(500).json({ error: e.message || 'Erro ao buscar administradores SaaS' });
    }
  }

  async indexAluno(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req);
      const resultado = await UsuarioService.findAllAlunos(tenantId, req.query);
      return res.json(resultado);
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao buscar alunos' });
    }
  }

  async showAdmin(req, res) {
    const tenantId = await resolveTenantIdForAdminRequest(req);
    const user = await UsuarioService.findAdminById(req.params.id, tenantId);
    return user ? res.json(user) : res.status(404).json({ error: 'Não encontrado' });
  }

  async showSaasAdmin(req, res) {
    const user = await UsuarioService.findSaasAdminById(req.params.id, req.userRole);
    return user ? res.json(user) : res.status(404).json({ error: 'Não encontrado' });
  }

  async showAluno(req, res) {
    const tenantId = await resolveTenantIdForAdminRequest(req);
    const user = await UsuarioService.findAlunoById(req.params.id, tenantId);
    return user ? res.json(user) : res.status(404).json({ error: 'Não encontrado' });
  }

  async updateAdmin(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req);
      const user = await UsuarioService.updateAdmin(req.params.id, tenantId, req.body);
      return res.json(user);
    } catch (e) {
      return res.status(400).json({ error: e.message || 'Erro ao atualizar administrador' });
    }
  }

  async updateSaasAdmin(req, res) {
    try {
      const user = await UsuarioService.updateSaasAdmin(req.params.id, req.userRole, req.body);
      return res.json(user);
    } catch (e) {
      return res.status(400).json({ error: e.message || 'Erro ao atualizar administrador SaaS' });
    }
  }

  async updateAluno(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req);
      const user = await UsuarioService.updateAluno(req.params.id, tenantId, req.body);
      return res.json(user);
    } catch (e) {
      return res.status(400).json({ error: e.message || 'Erro ao atualizar aluno' });
    }
  }

  async delete(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req);
      await UsuarioService.deleteUser(req.params.id, tenantId);
      return res.status(204).send();
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async deleteSaasAdmin(req, res) {
    try {
      await UsuarioService.deleteSaasAdmin(req.params.id, req.userRole, req.userId);
      return res.status(204).send();
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async login(req, res) {
    try {
      const { identificador, senha, tenant_id, tenant_slug } = req.body;
      const { usuario, token } = await UsuarioService.login(identificador, senha, {
        tenant_id,
        tenant_slug,
      });

      return res.json({ usuario, token });
    } catch (e) {
      return res.status(401).json({ error: e.message });
    }
  }

  async logout(req, res) {
    return res.status(200).json({ message: 'Logout realizado com sucesso. Remova o token do cliente.' });
  }

  async me(req, res) {
    try {
      const user = await UsuarioService.getMe(req.userId, req.tenantId, req.userRole);
      return res.json(user);
    } catch (e) {
      return res.status(404).json({ error: e.message });
    }
  }
}

export default new UsuarioController();
