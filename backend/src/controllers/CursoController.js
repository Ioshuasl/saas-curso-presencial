import CursoService from '../services/CursoService.js';
import InscricaoService from '../services/InscricaoService.js';
import { uploadToS3 } from '../config/aws-s3.js';
import { resolveTenantId } from '../utils/tenantContext.js';
import { resolveTenantIdForAdminRequest } from '../utils/tenantAdminContext.js';

async function resolveTenantForRead(req) {
  // Regra de segurança: se existe usuário autenticado, sempre respeitar o tenant do token.
  // Isso evita leitura acidental de outro tenant quando há query stale no cliente.
  if (req.tenantId) {
    return req.tenantId;
  }
  return resolveTenantId(req.query);
}

function parseSessoesIfNeeded(rawSessoes) {
  if (typeof rawSessoes !== 'string') return rawSessoes;
  if (!rawSessoes.trim()) return [];
  try {
    return JSON.parse(rawSessoes);
  } catch {
    return rawSessoes;
  }
}

class CursoController {
  async store(req, res) {
    try {
      const dados = { ...req.body };
      dados.sessoes = parseSessoesIfNeeded(dados.sessoes);
      const tenantId = await resolveTenantIdForAdminRequest(req);
      if (req.file) {
        const { url } = await uploadToS3(
          req.file,
          `tenants/${tenantId}/cursos`
        );
        dados.url_imagem = url;
      }
      const curso = await CursoService.create(tenantId, dados);
      return res.status(201).json(curso);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async index(req, res) {
    try {
      const tenantId = await resolveTenantForRead(req);
      const resultado = await CursoService.findAll(req.query, tenantId);
      return res.json(resultado);
    } catch (e) {
      const msg = e.message || '';
      if (msg.includes('tenant') || msg.includes('Tenant') || msg.includes('Informe')) {
        return res.status(400).json({ error: e.message });
      }
      return res.status(500).json({ error: 'Erro ao buscar cursos' });
    }
  }

  async byDate(req, res) {
    try {
      const { data } = req.query;

      if (!data) {
        return res.status(400).json({ error: 'Parâmetro "data" é obrigatório no formato YYYY-MM-DD' });
      }

      const tenantId = await resolveTenantForRead(req);
      const cursos = await CursoService.findBySessionDate(data, tenantId);
      return res.json(cursos);
    } catch (e) {
      if (e.message && (e.message.includes('tenant') || e.message.includes('Informe'))) {
        return res.status(400).json({ error: e.message });
      }
      return res.status(500).json({ error: 'Erro ao buscar cursos pela data informada' });
    }
  }

  async show(req, res) {
    try {
      const tenantId = await resolveTenantForRead(req);
      const curso = await CursoService.findById(req.params.id, tenantId);
      return res.json(curso);
    } catch (e) {
      if (e.message && (e.message.includes('tenant') || e.message.includes('Informe'))) {
        return res.status(400).json({ error: e.message });
      }
      return res.status(404).json({ error: e.message });
    }
  }

  async update(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req);
      const dados = { ...req.body };
      dados.sessoes = parseSessoesIfNeeded(dados.sessoes);

      if (req.file) {
        const { url } = await uploadToS3(req.file, `tenants/${tenantId}/cursos`);
        dados.url_imagem = url;
      } else if (dados.url_imagem === '') {
        // Permite limpar imagem quando o cliente envia string vazia.
        dados.url_imagem = null;
      }

      const curso = await CursoService.update(req.params.id, tenantId, dados);
      return res.json(curso);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async delete(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req);
      await CursoService.delete(req.params.id, tenantId);
      return res.status(204).send();
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async checkVagas(req, res) {
    try {
      const tenantId = await resolveTenantForRead(req);
      const info = await CursoService.getVagasInfo(req.params.id, tenantId);
      return res.json(info);
    } catch (e) {
      if (e.message && (e.message.includes('tenant') || e.message.includes('Informe'))) {
        return res.status(400).json({ error: e.message });
      }
      return res.status(404).json({ error: e.message });
    }
  }

  async meusCursos(req, res) {
    try {
      const cursos = await CursoService.findCursosByAlunoId(req.userId, req.tenantId);
      return res.json(cursos);
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao buscar cursos do aluno' });
    }
  }

  async listAlunos(req, res) {
    try {
      const tenantId = await resolveTenantIdForAdminRequest(req);
      const alunos = await InscricaoService.findByCurso(req.params.id, tenantId);
      return res.json(alunos);
    } catch (e) {
      return res.status(404).json({ error: e.message });
    }
  }
}

export default new CursoController();
