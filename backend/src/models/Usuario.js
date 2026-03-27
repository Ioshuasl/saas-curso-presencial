import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Tenant from './Tenant.js';

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Tenant, key: 'id' },
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: { isEmail: true }
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: true,
  },
  senha_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'ALUNO', 'SAAS_ADMIN'),
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  tableName: 'usuarios',
  indexes: [
    { unique: true, fields: ['tenant_id', 'username'], name: 'usuarios_tenant_id_username_unique' },
    { unique: true, fields: ['tenant_id', 'email'], name: 'usuarios_tenant_id_email_unique' },
    { unique: true, fields: ['tenant_id', 'cpf'], name: 'usuarios_tenant_id_cpf_unique' },
  ],
});

export default Usuario;