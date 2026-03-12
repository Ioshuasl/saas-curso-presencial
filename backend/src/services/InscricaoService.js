import { Inscricao, Usuario, PerfilAluno, Curso, SessaoCurso } from '../models/index.js';
import CursoService from './CursoService.js';

class InscricaoService {
  // --- MATRICULAR ALUNO ---
  async create(aluno_id, curso_id) {
    // 1. Verifica se o curso existe e tem vagas
    const infoVagas = await CursoService.getVagasInfo(curso_id);
    
    if (!infoVagas.tem_vaga) {
      throw new Error('Não há vagas disponíveis para este curso.');
    }

    // 2. Verifica se o aluno já está inscrito (evitar duplicidade)
    const inscricaoExistente = await Inscricao.findOne({
      where: { aluno_id, curso_id }
    });

    if (inscricaoExistente) {
      throw new Error('Este aluno já está matriculado neste curso.');
    }

    // 3. Cria a inscrição
    return await Inscricao.create({
      aluno_id,
      curso_id,
      data_inscricao: new Date()
    });
  }

  // --- LISTAR ALUNOS DE UM CURSO ---
  async findByCurso(curso_id) {
    const curso = await Curso.findByPk(curso_id, {
      include: [{
        model: Usuario,
        as: 'alunos_inscritos',
        attributes: ['id', 'username', 'email'],
        include: [{ model: PerfilAluno, as: 'perfil_aluno' }]
      }]
    });

    if (!curso) throw new Error('Curso não encontrado');
    return curso.alunos_inscritos;
  }

  // --- LISTAR CURSOS DE UM ALUNO ---
  async findByAluno(aluno_id) {
    const aluno = await Usuario.findByPk(aluno_id, {
      attributes: ['id', 'username'],
      include: [{
        model: Curso,
        as: 'cursos_inscritos',
        include: [{ model: SessaoCurso, as: 'sessoes' }],
        through: { attributes: ['data_inscricao'] } // Traz a data que ele se inscreveu
      }]
    });

    if (!aluno) throw new Error('Aluno não encontrado');
    return aluno.cursos_inscritos;
  }

  // --- CANCELAR INSCRIÇÃO ---
  async delete(aluno_id, curso_id) {
    const inscricao = await Inscricao.findOne({
      where: { aluno_id, curso_id }
    });

    if (!inscricao) {
      throw new Error('Inscrição não encontrada para este aluno neste curso.');
    }

    await inscricao.destroy();
    return true;
  }

  // --- CONFIRMAR PRESENÇA DO ALUNO EM UM CURSO ---
  async confirmarPresenca(aluno_id, curso_id) {
    const inscricao = await Inscricao.findOne({
      where: { aluno_id, curso_id },
    });

    if (!inscricao) {
      throw new Error('Inscrição não encontrada para este aluno neste curso.');
    }

    inscricao.presenca_confirmada = true;
    await inscricao.save();

    return inscricao;
  }
}

export default new InscricaoService();