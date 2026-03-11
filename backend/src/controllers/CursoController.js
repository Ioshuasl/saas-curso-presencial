import CursoService from '../services/CursoService.js';
import InscricaoService from '../services/InscricaoService.js';

class CursoController {
  // --- CRIAR CURSO ---
  async store(req, res) {
    try {
      const curso = await CursoService.create(req.body);
      return res.status(201).json(curso);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  // --- LISTAR TODOS OS CURSOS ---
  async index(req, res) {
    try {
      const cursos = await CursoService.findAll();
      return res.json(cursos);
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao buscar cursos' });
    }
  }

  // --- LISTAR CURSOS POR DATA DE SESSÃO ---
  async byDate(req, res) {
    try {
      const { data } = req.query;

      if (!data) {
        return res.status(400).json({ error: 'Parâmetro "data" é obrigatório no formato YYYY-MM-DD' });
      }

      const cursos = await CursoService.findBySessionDate(data);
      return res.json(cursos);
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao buscar cursos pela data informada' });
    }
  }

  // --- BUSCAR CURSO POR ID (COM SESSÕES) ---
  async show(req, res) {
    try {
      const curso = await CursoService.findById(req.params.id);
      return res.json(curso);
    } catch (e) {
      return res.status(404).json({ error: e.message });
    }
  }

  // --- ATUALIZAR CURSO E SESSÕES ---
  async update(req, res) {
    try {
      const curso = await CursoService.update(req.params.id, req.body);
      return res.json(curso);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  // --- EXCLUIR CURSO ---
  async delete(req, res) {
    try {
      await CursoService.delete(req.params.id);
      return res.status(204).send();
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  // --- CONSULTAR VAGAS (LOGICA ADICIONAL) ---
  async checkVagas(req, res) {
    try {
      const info = await CursoService.getVagasInfo(req.params.id);
      return res.json(info);
    } catch (e) {
      return res.status(404).json({ error: e.message });
    }
  }

  // --- LISTAR ALUNOS DO CURSO ---
  async listAlunos(req, res) {
    try {
      const alunos = await InscricaoService.findByCurso(req.params.id);
      return res.json(alunos);
    } catch (e) {
      return res.status(404).json({ error: e.message });
    }
  }
}

export default new CursoController();