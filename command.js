require('dotenv').config();

const { sequelize } = require('./src/models');
const { runMigrations, resetDatabase } = require('./src/database/migrationRunner');
const { runSeed } = require('./src/seeders/seed');

async function main() {
  const command = process.argv[2];

  if (!command) {
    console.log('Uso: node command.js <migrate|seed|reset>');
    process.exit(0);
  }

  if (command === 'migrate') {
    await runMigrations();
    console.log('Migrations finalizadas.');
    return;
  }

  if (command === 'seed') {
    await runSeed();
    console.log('Seed finalizada.');
    return;
  }

  if (command === 'reset') {
    await resetDatabase();
    await runMigrations();
    await runSeed();
    console.log('Banco resetado, migrado e populado.');
    return;
  }

  console.log(`Comando desconhecido: ${command}`);
  process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error('Erro no command.js:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
