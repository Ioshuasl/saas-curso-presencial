import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Usuario from './Usuario.js';

const PerfilAdministrador = sequelize.define('PerfilAdministrador', {
  usuario_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: Usuario, key: 'id' },
    onDelete: 'CASCADE'
  },
  nome_completo: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'perfil_administrador',
});

export default PerfilAdministrador;