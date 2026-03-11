import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Curso = sequelize.define('Curso', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  url_imagem: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ministrante: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  conteudo: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  vagas: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  local: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  tableName: 'cursos'
});

export default Curso;