import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import ContaReceber from './ContaReceber.js';

const ParcelaContaReceber = sequelize.define('ParcelaContaReceber', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  conta_receber_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ContaReceber,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  numero_parcela: {
    type: DataTypes.INTEGER,
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
  pago: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  data_pagamento: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'parcelas_conta_receber',
});

export default ParcelaContaReceber;
