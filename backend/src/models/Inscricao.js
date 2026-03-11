import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Inscricao = sequelize.define('Inscricao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  aluno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  curso_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  data_inscricao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'inscricoes'
});

export default Inscricao;