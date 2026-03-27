import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Uma linha por tenant: preferências e opções configuráveis pelo cliente (JSON).
 */
const Config = sequelize.define(
  'Config',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    tableName: 'configs',
  }
);

export default Config;
