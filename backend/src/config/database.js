import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        define: {
            timestamps: true,    // Garante que todos os models tenham timestamps
            underscored: true,   // created_at e updated_at (padrão Postgres)
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

export default sequelize;