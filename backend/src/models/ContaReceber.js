import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Curso from './Curso.js';
import Usuario from './Usuario.js';
import Tenant from './Tenant.js';

const ContaReceber = sequelize.define('ContaReceber', {
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
  aluno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'id',
    },
  },
  curso_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Curso,
      key: 'id',
    },
  },
  forma_pagamento: {
    type: DataTypes.ENUM('PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO'),
    allowNull: false,
  },
  valor_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  descricao: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  observacao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'contas_receber',
});

export default ContaReceber;
