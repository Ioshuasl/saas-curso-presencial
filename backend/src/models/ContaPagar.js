import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Curso from './Curso.js';

const ContaPagar = sequelize.define('ContaPagar', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  descricao: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  data_vencimento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  data_pagamento: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  observacao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('PENDENTE', 'PAGO', 'ATRASADO'),
    allowNull: false,
    defaultValue: 'PENDENTE',
  },
  curso_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Curso,
      key: 'id',
    },
  },
}, {
  tableName: 'contas_pagar',
});

export default ContaPagar;

