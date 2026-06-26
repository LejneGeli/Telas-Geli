require('dotenv').config();

const { sequelize } = require('./src/models');
const { runMigrations } = require('./src/database/migrationRunner');
const { runSeed } = require('./src/seeders/seed');

async function resetDatabase() {
  console.log('Resetando banco de dados...');

  await sequelize.query('DROP TABLE IF EXISTS request_items CASCADE;');
  await sequelize.query('DROP TABLE IF EXISTS measurement_visits CASCADE;');
  await sequelize.query('DROP TABLE IF EXISTS service_requests CASCADE;');
  await sequelize.query('DROP TABLE IF EXISTS addresses CASCADE;');
  await sequelize.query('DROP TABLE IF EXISTS screen_types CASCADE;');
  await sequelize.query('DROP TABLE IF EXISTS customers CASCADE;');
  await sequelize.query('DROP TABLE IF EXISTS users CASCADE;');
  await sequelize.query('DROP TABLE IF EXISTS migrations CASCADE;');

  console.log('Tabelas removidas.');

  console.log('Executando migrations...');
  await runMigrations();

  console.log('Executando seed...');
  await runSeed();

  console.log('Reset finalizado.');
}

async function main() {
  const command = process.argv[2];

  try {
    await sequelize.authenticate();

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
      return;
    }

    console.log('Comando inválido.');
    console.log('Use:');
    console.log('node command.js migrate');
    console.log('node command.js seed');
    console.log('node command.js reset');
    process.exitCode = 1;
  } catch (error) {
    console.error('Erro no command.js:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

main();