import express from 'express';
import cors from 'cors';
import sequelize from './config/database.js';
import routes from './routes/index.js';
import { swaggerSpec, swaggerUiMiddleware } from './config/swagger.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', routes);
app.use('/api-docs', swaggerUiMiddleware.serve, swaggerUiMiddleware.setup(swaggerSpec));

// Função para iniciar o servidor e o banco
async function startServer() {
  try {
    // 1. Autentica a conexão
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');

    // 2. Sincroniza os modelos (Cria as tabelas se não existirem)
    // Em produção, o ideal é usar Migrations, mas para desenvolvimento sync() ajuda muito.
    await sequelize.sync({ alter: true }); 
    console.log('✅ Modelos sincronizados com o banco de dados.');

    // 3. Inicia o servidor Express
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
  }
}

startServer();