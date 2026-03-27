import sequelize from '../config/database.js';
import Tenant from './Tenant.js';
import Config from './Config.js';
import Usuario from './Usuario.js';
import PerfilAdministrador from './PerfilAdministrador.js';
import PerfilAluno from './PerfilAluno.js';
import Curso from './Curso.js';
import SessaoCurso from './SessaoCurso.js';
import Inscricao from './Inscricao.js';
import QuestionarioInicial from './QuestionarioInicial.js';
import FeedbackFinal from './FeedbackFinal.js';
import ContaPagar from './ContaPagar.js';
import ContaReceber from './ContaReceber.js';
import ParcelaContaReceber from './ParcelaContaReceber.js';

// --- Tenant e Config (1:1) ---
Tenant.hasOne(Config, {
  foreignKey: 'tenant_id',
  as: 'config',
  onDelete: 'CASCADE',
  hooks: true,
});
Config.belongsTo(Tenant, { foreignKey: 'tenant_id', onDelete: 'CASCADE' });

// --- Tenant ↔ demais entidades (multi-tenant) ---
Tenant.hasMany(Usuario, { foreignKey: 'tenant_id', as: 'usuarios' });
Usuario.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(PerfilAdministrador, { foreignKey: 'tenant_id', as: 'perfis_administrador' });
PerfilAdministrador.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(PerfilAluno, { foreignKey: 'tenant_id', as: 'perfis_aluno' });
PerfilAluno.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(Curso, { foreignKey: 'tenant_id', as: 'cursos' });
Curso.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(SessaoCurso, { foreignKey: 'tenant_id', as: 'sessoes_curso' });
SessaoCurso.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(Inscricao, { foreignKey: 'tenant_id', as: 'inscricoes' });
Inscricao.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(QuestionarioInicial, { foreignKey: 'tenant_id', as: 'questionarios_iniciais' });
QuestionarioInicial.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(FeedbackFinal, { foreignKey: 'tenant_id', as: 'feedbacks_finais' });
FeedbackFinal.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(ContaPagar, { foreignKey: 'tenant_id', as: 'contas_pagar' });
ContaPagar.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(ContaReceber, { foreignKey: 'tenant_id', as: 'contas_receber' });
ContaReceber.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(ParcelaContaReceber, { foreignKey: 'tenant_id', as: 'parcelas_conta_receber' });
ParcelaContaReceber.belongsTo(Tenant, { foreignKey: 'tenant_id' });

// --- Relacionamentos de Perfil ---
Usuario.hasOne(PerfilAdministrador, { foreignKey: 'usuario_id', as: 'perfil_admin' });
PerfilAdministrador.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Usuario.hasOne(PerfilAluno, { foreignKey: 'usuario_id', as: 'perfil_aluno' });
PerfilAluno.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// --- Relacionamentos de Curso ---

// 1 Curso tem muitas Sessões (1:N)
Curso.hasMany(SessaoCurso, { 
  foreignKey: 'curso_id', 
  as: 'sessoes',
  onDelete: 'CASCADE', // Se o curso sumir, as sessões somem
  hooks: true 
});
SessaoCurso.belongsTo(Curso, { foreignKey: 'curso_id' });

// Inscrições do aluno (1:N) — para incluir questionário/feedback por inscrição
Usuario.hasMany(Inscricao, { foreignKey: 'aluno_id', as: 'inscricoes' });
Inscricao.belongsTo(Usuario, { foreignKey: 'aluno_id' });

// Inscrição pertence a um curso (N:1) — necessário para include { as: 'curso' }
Curso.hasMany(Inscricao, {
  foreignKey: 'curso_id',
  as: 'inscricoes',
});
Inscricao.belongsTo(Curso, {
  foreignKey: 'curso_id',
  as: 'curso',
});

// Relacionamento Muitos-para-Muitos (N:N) Alunos <-> Cursos
// Um Aluno (Usuario com role ALUNO) pode ter várias inscrições
Usuario.belongsToMany(Curso, { 
  through: Inscricao, 
  foreignKey: 'aluno_id',
  otherKey: 'curso_id',
  as: 'cursos_inscritos'
});

// Um Curso pode ter vários Alunos inscritos
Curso.belongsToMany(Usuario, { 
  through: Inscricao, 
  foreignKey: 'curso_id',
  otherKey: 'aluno_id',
  as: 'alunos_inscritos'
});

// --- Relacionamentos de Questionário e Feedback com Inscrição ---
Inscricao.hasOne(QuestionarioInicial, {
  foreignKey: 'inscricao_id',
  as: 'questionario_inicial',
  onDelete: 'CASCADE',
  hooks: true,
});
QuestionarioInicial.belongsTo(Inscricao, { foreignKey: 'inscricao_id' });

Inscricao.hasOne(FeedbackFinal, {
  foreignKey: 'inscricao_id',
  as: 'feedback_final',
  onDelete: 'CASCADE',
  hooks: true,
});
FeedbackFinal.belongsTo(Inscricao, { foreignKey: 'inscricao_id' });

// --- Relacionamentos Financeiros ---
// Despesas podem estar vinculadas a um curso específico
Curso.hasMany(ContaPagar, {
  foreignKey: 'curso_id',
  as: 'despesas',
});
ContaPagar.belongsTo(Curso, { foreignKey: 'curso_id' });

// Contas a receber são sempre vinculadas a um curso e a um aluno
Curso.hasMany(ContaReceber, {
  foreignKey: 'curso_id',
  as: 'contas_receber',
});
ContaReceber.belongsTo(Curso, { foreignKey: 'curso_id' });

Usuario.hasMany(ContaReceber, {
  foreignKey: 'aluno_id',
  as: 'contas_receber_aluno',
});
ContaReceber.belongsTo(Usuario, { foreignKey: 'aluno_id' });

// Uma conta a receber tem várias parcelas
ContaReceber.hasMany(ParcelaContaReceber, {
  foreignKey: 'conta_receber_id',
  as: 'parcelas',
  onDelete: 'CASCADE',
});
ParcelaContaReceber.belongsTo(ContaReceber, { foreignKey: 'conta_receber_id' });

export {
  sequelize,
  Tenant,
  Config,
  Usuario,
  PerfilAdministrador,
  PerfilAluno,
  Curso,
  SessaoCurso,
  Inscricao,
  QuestionarioInicial,
  FeedbackFinal,
  ContaPagar,
  ContaReceber,
  ParcelaContaReceber,
};