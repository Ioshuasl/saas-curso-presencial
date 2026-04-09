/* eslint-disable no-undef */
require('dotenv').config();

const {
  DB_NAME,
  DB_USER,
  DB_PASS,
  DB_HOST,
} = process.env;

if (!DB_NAME || !DB_USER || !DB_HOST) {
  // sequelize-cli precisa dos envs para conectar ao banco.
  // DB_PASS pode existir como vazio em alguns ambientes locais.
  // eslint-disable-next-line no-console
  console.warn(
    '[sequelize] Atenção: DB_NAME/DB_USER/DB_HOST nao estao definidos no ambiente.',
  );
}

module.exports = {
  development: {
    username: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    host: DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    host: DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    dialect: 'postgres',
    logging: false,
  },
};

