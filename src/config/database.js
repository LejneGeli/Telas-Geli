const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'mosquiteiras_db',
  process.env.DB_USER || 'mosquiteiras_user',
  process.env.DB_PASSWORD || 'mosquiteiras_password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    dialect: 'postgres',
    logging: false,
    define: {
      underscored: true,
      timestamps: true
    }
  }
);

module.exports = sequelize;
