const { DataTypes, QueryTypes } = require('sequelize');
const { sequelize } = require('../models');

const migrations = [
  {
    id: '001_create_users',
    up: async (queryInterface) => {
      await queryInterface.createTable('users', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING(120), allowNull: false },
        email: { type: DataTypes.STRING(180), allowNull: false, unique: true },
        password_hash: { type: DataTypes.STRING(255), allowNull: false },
        role: { type: DataTypes.ENUM('admin', 'professional', 'attendant'), allowNull: false, defaultValue: 'attendant' },
        created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
      });
      await queryInterface.addIndex('users', ['email'], { unique: true, name: 'idx_users_email_unique' });
    }
  },
  {
    id: '002_create_customers',
    up: async (queryInterface) => {
      await queryInterface.createTable('customers', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING(140), allowNull: false },
        email: { type: DataTypes.STRING(180), allowNull: true },
        phone: { type: DataTypes.STRING(30), allowNull: false },
        document: { type: DataTypes.STRING(20), allowNull: true, unique: true },
        created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
      });
      await queryInterface.addIndex('customers', ['phone'], { name: 'idx_customers_phone' });
      await queryInterface.addIndex('customers', ['email'], { name: 'idx_customers_email' });
      await queryInterface.addIndex('customers', ['document'], { unique: true, name: 'idx_customers_document_unique' });
    }
  },
  {
    id: '003_create_addresses',
    up: async (queryInterface) => {
      await queryInterface.createTable('addresses', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        customer_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'customers', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        street: { type: DataTypes.STRING(160), allowNull: false },
        number: { type: DataTypes.STRING(20), allowNull: false },
        neighborhood: { type: DataTypes.STRING(100), allowNull: false },
        city: { type: DataTypes.STRING(100), allowNull: false },
        state: { type: DataTypes.STRING(2), allowNull: false },
        zip_code: { type: DataTypes.STRING(12), allowNull: false },
        complement: { type: DataTypes.STRING(160), allowNull: true },
        created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
      });
      await queryInterface.addIndex('addresses', ['customer_id'], { name: 'idx_addresses_customer_id' });
      await queryInterface.addIndex('addresses', ['city', 'state'], { name: 'idx_addresses_city_state' });
    }
  },
  {
    id: '004_create_screen_types',
    up: async (queryInterface) => {
      await queryInterface.createTable('screen_types', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING(120), allowNull: false, unique: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        base_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        is_available: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
      });
      await queryInterface.addIndex('screen_types', ['name'], { unique: true, name: 'idx_screen_types_name_unique' });
      await queryInterface.addIndex('screen_types', ['is_available'], { name: 'idx_screen_types_is_available' });
    }
  },
  {
    id: '005_create_service_requests',
    up: async (queryInterface) => {
      await queryInterface.createTable('service_requests', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        customer_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'customers', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
        address_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'addresses', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
        status: {
          type: DataTypes.ENUM('pending', 'waiting_measurement', 'measured', 'budget_sent', 'approved', 'rejected', 'scheduled', 'completed', 'cancelled'),
          allowNull: false,
          defaultValue: 'pending'
        },
        measurement_required: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        preferred_date: { type: DataTypes.DATEONLY, allowNull: true },
        total_estimated_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
      });
      await queryInterface.addIndex('service_requests', ['customer_id'], { name: 'idx_service_requests_customer_id' });
      await queryInterface.addIndex('service_requests', ['address_id'], { name: 'idx_service_requests_address_id' });
      await queryInterface.addIndex('service_requests', ['status'], { name: 'idx_service_requests_status' });
      await queryInterface.addIndex('service_requests', ['created_at'], { name: 'idx_service_requests_created_at' });
    }
  },
  {
    id: '006_create_measurement_visits',
    up: async (queryInterface) => {
      await queryInterface.createTable('measurement_visits', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        service_request_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'service_requests', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        professional_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
        scheduled_date: { type: DataTypes.DATE, allowNull: false },
        status: { type: DataTypes.ENUM('pending', 'scheduled', 'completed', 'cancelled'), allowNull: false, defaultValue: 'pending' },
        notes: { type: DataTypes.TEXT, allowNull: true },
        created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
      });
      await queryInterface.addIndex('measurement_visits', ['service_request_id'], { name: 'idx_measurement_visits_service_request_id' });
      await queryInterface.addIndex('measurement_visits', ['professional_id'], { name: 'idx_measurement_visits_professional_id' });
      await queryInterface.addIndex('measurement_visits', ['scheduled_date'], { name: 'idx_measurement_visits_scheduled_date' });
      await queryInterface.addIndex('measurement_visits', ['status'], { name: 'idx_measurement_visits_status' });
    }
  },
  {
    id: '007_create_request_items',
    up: async (queryInterface) => {
      await queryInterface.createTable('request_items', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        service_request_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'service_requests', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        screen_type_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'screen_types', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
        quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        width: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
        height: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
        room: { type: DataTypes.STRING(80), allowNull: true },
        notes: { type: DataTypes.TEXT, allowNull: true },
        unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
      });
      await queryInterface.addIndex('request_items', ['service_request_id'], { name: 'idx_request_items_service_request_id' });
      await queryInterface.addIndex('request_items', ['screen_type_id'], { name: 'idx_request_items_screen_type_id' });
      await queryInterface.addIndex('request_items', ['room'], { name: 'idx_request_items_room' });
    }
  }
];

async function ensureMigrationsTable(queryInterface) {
  await queryInterface.createTable('migrations', {
    id: { type: DataTypes.STRING(120), primaryKey: true },
    executed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
  }).catch((error) => {
    if (!String(error.message).includes('already exists')) throw error;
  });
}

async function runMigrations() {
  await sequelize.authenticate();
  const queryInterface = sequelize.getQueryInterface();
  await ensureMigrationsTable(queryInterface);

  const executed = await sequelize.query('SELECT id FROM migrations', { type: QueryTypes.SELECT });
  const executedIds = new Set(executed.map((row) => row.id));

  for (const migration of migrations) {
    if (executedIds.has(migration.id)) {
      console.log(`Pulando migration já executada: ${migration.id}`);
      continue;
    }

    console.log(`Executando migration: ${migration.id}`);
    await sequelize.transaction(async (transaction) => {
      await migration.up(queryInterface, transaction);
      await sequelize.query('INSERT INTO migrations (id) VALUES (:id)', {
        replacements: { id: migration.id },
        transaction
      });
    });
  }
}

async function resetDatabase() {
  await sequelize.authenticate();
  await sequelize.drop({ cascade: true });
  await sequelize.query('DROP TYPE IF EXISTS enum_users_role CASCADE');
  await sequelize.query('DROP TYPE IF EXISTS enum_service_requests_status CASCADE');
  await sequelize.query('DROP TYPE IF EXISTS enum_measurement_visits_status CASCADE');
}

module.exports = { runMigrations, resetDatabase };
