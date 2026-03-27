import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Tenant from './Tenant.js';

const SessaoCurso = sequelize.define('SessaoCurso', {
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
  curso_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  data: {
    type: DataTypes.DATEONLY, // Apenas a data (YYYY-MM-DD)
    allowNull: false,
  },
  horario_inicio: {
    type: DataTypes.TIME, // Apenas a hora (HH:MM:SS)
    allowNull: false,
  },
  horario_fim: {
    type: DataTypes.TIME,
    allowNull: false,
  }
}, {
  tableName: 'sessoes_curso'
});

export default SessaoCurso;