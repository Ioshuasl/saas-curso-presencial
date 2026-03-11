import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Inscricao from './Inscricao.js';

const QuestionarioInicial = sequelize.define('QuestionarioInicial', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
  maior_dor_inicio: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  principal_expectativa: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'questionarios_iniciais',
});

export default QuestionarioInicial;

