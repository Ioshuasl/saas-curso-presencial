import cors from 'cors';
import express from 'express';
import sequelize from './config/database.js';
import { swaggerSpec, swaggerUiMiddleware } from './config/swagger.js';
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 8080;
const MAX_PORT_RETRIES = 5;
let httpServer = null;
let processKeeper = null;

app.use(cors());
app.use(express.json());

app.use('/api', routes);
app.use('/api-docs', swaggerUiMiddleware.serve, swaggerUiMiddleware.setup(swaggerSpec));

function listenAsync(port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => resolve(server));
    server.on('error', reject);
  });
}

async function startHttpServer(basePort) {
  let port = Number(basePort);
  let attempts = 0;

  while (attempts <= MAX_PORT_RETRIES) {
    try {
      const server = await listenAsync(port);
      // Mantém referência global para evitar GC prematuro em alguns ambientes.
      httpServer = server;
      if (typeof httpServer.ref === 'function') {
        httpServer.ref();
      }
      console.log(`🚀 Servidor rodando em http://localhost:${port}`);
      return server;
    } catch (error) {
      if (error?.code === 'EADDRINUSE' && attempts < MAX_PORT_RETRIES) {
        console.warn(`⚠️ Porta ${port} em uso. Tentando porta ${port + 1}...`);
        port += 1;
        attempts += 1;
        continue;
      }
      throw error;
    }
  }

  throw new Error('Não foi possível iniciar o servidor em nenhuma porta disponível.');
}

function startProcessKeeper() {
  if (processKeeper) return;
  // Mantém o event loop ativo em ambientes onde o processo encerra com beforeExit(0)
  // mesmo após app.listen. Encerramos esse timer no shutdown gracioso.
  processKeeper = setInterval(() => {}, 60 * 60 * 1000);
}

function setupGracefulShutdown() {
  const shutdown = async (signal) => {
    try {
      console.log(`🛑 Recebido ${signal}. Encerrando servidor...`);
      if (processKeeper) {
        clearInterval(processKeeper);
        processKeeper = null;
      }

      if (httpServer) {
        await new Promise((resolve, reject) => {
          httpServer.close((err) => (err ? reject(err) : resolve()));
        });
      }

      await sequelize.close();
      process.exit(0);
    } catch (error) {
      console.error('❌ Erro no shutdown gracioso:', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

process.on('beforeExit', (code) => {
  console.warn(`⚠️ Processo entrando em beforeExit (code=${code}).`);
});

process.on('exit', (code) => {
  console.warn(`⚠️ Processo finalizado (code=${code}).`);
});

process.on('uncaughtException', (error) => {
  console.error('❌ uncaughtException:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ unhandledRejection:', reason);
});

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
    await startHttpServer(PORT);
    startProcessKeeper();
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
    process.exitCode = 1;
  }
}

setupGracefulShutdown();
startServer();
