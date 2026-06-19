require('dotenv').config();

const app = require('./src/app');
const { sequelize } = require('./src/models');

const PORT = Number(process.env.PORT || 3000);

async function waitForDatabase(retries = 20, delayMs = 2000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await sequelize.authenticate();
      console.log('Conexão com PostgreSQL estabelecida.');
      return;
    } catch (error) {
      console.log(`Aguardando PostgreSQL... tentativa ${attempt}/${retries}`);
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

waitForDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor Node privado rodando na porta ${PORT}. Acesse pelo Nginx em http://localhost:8080`);
    });
  })
  .catch((error) => {
    console.error('Falha ao iniciar o servidor:', error);
    process.exit(1);
  });
