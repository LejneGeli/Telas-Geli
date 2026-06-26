const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const routes = require('./routes');
const authMiddleware = require('./middlewares/authMiddleware');
const requestLogger = require('./middlewares/requestLogger');
const { sequelize } = require('./models');
const { connectRedis } = require('./config/redis');

const app = express();
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger', 'swagger.yaml'));

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));
app.use(requestLogger);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', authMiddleware, (req, res) => {
  res.json({
    name: 'Telas Mosqueteiras API',
    status: 'online',
    docs: '/api-docs',
    login: '/login'
  });
});

app.get('/health', authMiddleware, async (req, res) => {
  let database = 'down';
  let redisStatus = 'down';

  try {
    await sequelize.authenticate();
    database = 'up';
  } catch (error) {
    database = `down: ${error.message}`;
  }

  try {
    const redis = await connectRedis();
    if (redis) {
      await redis.ping();
      redisStatus = 'up';
    }
  } catch (error) {
    redisStatus = `down: ${error.message}`;
  }

  res.json({ app: 'up', database, redis: redisStatus });
});

app.use(routes);

app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada.' });
});

app.use((error, req, res, next) => {
  console.error(error);
  if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ message: 'Erro de validação.', details: error.errors.map((item) => item.message) });
  }
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ message: 'Erro de chave estrangeira.', details: error.message });
  }
  return res.status(500).json({ message: 'Erro interno no servidor.' });
});

module.exports = app;
