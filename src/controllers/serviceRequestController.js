const {
  ServiceRequest,
  Customer,
  Address,
  RequestItem,
  ScreenType,
  MeasurementVisit,
  User
} = require('../models');
const { connectRedis } = require('../config/redis');

const includeFull = [
  { model: Customer, as: 'customer' },
  { model: Address, as: 'address' },
  { model: RequestItem, as: 'items', include: [{ model: ScreenType, as: 'screen_type' }] },
  { model: MeasurementVisit, as: 'measurement_visits', include: [{ model: User, as: 'professional', attributes: ['id', 'name', 'email', 'role'] }] }
];

function buildWhere(query) {
  const where = {};
  if (query.status) where.status = query.status;
  if (query.customer_id) where.customer_id = query.customer_id;
  if (query.measurement_required === 'true') where.measurement_required = true;
  if (query.measurement_required === 'false') where.measurement_required = false;
  return where;
}

async function clearCache() {
  const redis = await connectRedis();
  if (!redis) return;
  const keys = await redis.keys('service_requests:*');
  if (keys.length) await redis.del(keys);
}

async function list(req, res, next) {
  try {
    const cacheKey = `service_requests:${JSON.stringify(req.query)}`;
    const redis = await connectRedis();
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) return res.json(JSON.parse(cached));
    }

    const serviceRequests = await ServiceRequest.findAll({
      where: buildWhere(req.query),
      include: includeFull,
      order: [['id', 'ASC']]
    });

    if (redis) await redis.set(cacheKey, JSON.stringify(serviceRequests), 'EX', 60);
    return res.json(serviceRequests);
  } catch (error) { return next(error); }
}

async function get(req, res, next) {
  try {
    const serviceRequest = await ServiceRequest.findByPk(req.params.id, { include: includeFull });
    if (!serviceRequest) return res.status(404).json({ message: 'Solicitação não encontrada.' });
    return res.json(serviceRequest);
  } catch (error) { return next(error); }
}

async function create(req, res, next) {
  try {
    const payload = { ...req.body };
    if (payload.measurement_required === true && !payload.status) payload.status = 'waiting_measurement';
    const serviceRequest = await ServiceRequest.create(payload);
    await clearCache();
    return res.status(201).json(serviceRequest);
  } catch (error) { return next(error); }
}

async function update(req, res, next) {
  try {
    const serviceRequest = await ServiceRequest.findByPk(req.params.id);
    if (!serviceRequest) return res.status(404).json({ message: 'Solicitação não encontrada.' });
    await serviceRequest.update(req.body);
    await clearCache();
    return res.json(serviceRequest);
  } catch (error) { return next(error); }
}

async function remove(req, res, next) {
  try {
    const deleted = await ServiceRequest.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Solicitação não encontrada.' });
    await clearCache();
    return res.status(204).send();
  } catch (error) { return next(error); }
}

module.exports = { list, get, create, update, remove };
