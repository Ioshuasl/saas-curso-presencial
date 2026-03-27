import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Inscricao from './Inscricao.js';
import Tenant from './Tenant.js';

const FeedbackFinal = sequelize.define('FeedbackFinal', {
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
  inscricao_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Inscricao,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  objetivo_atingido: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  resultado_esperado: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  avaliacao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
}, {
  tableName: 'feedbacks_finais',
});

export default FeedbackFinal;

