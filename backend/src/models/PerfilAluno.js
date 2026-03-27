import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Usuario from './Usuario.js';
import Tenant from './Tenant.js';

const PerfilAluno = sequelize.define('PerfilAluno', {
  usuario_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: Usuario, key: 'id' },
    onDelete: 'CASCADE'
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Tenant, key: 'id' },
  },
  nome_completo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefone: {
    type: DataTypes.STRING,
  },
  cidade: {
    type: DataTypes.STRING,
  },
  profissao: {
    type: DataTypes.STRING,
  },
  biografia: {
    type: DataTypes.TEXT,
  }
}, {
  tableName: 'perfil_aluno',
});

export default PerfilAluno;