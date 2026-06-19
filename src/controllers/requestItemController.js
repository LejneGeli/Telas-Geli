const { RequestItem, ServiceRequest, ScreenType } = require('../models');

async function updateServiceRequestTotal(serviceRequestId) {
  const items = await RequestItem.findAll({ where: { service_request_id: serviceRequestId } });
  const total = items.reduce((sum, item) => sum + Number(item.total_price || 0), 0);
  await ServiceRequest.update({ total_estimated_price: total }, { where: { id: serviceRequestId } });
}

async function list(req, res, next) {
  try {
    const where = {};
    if (req.query.service_request_id) where.service_request_id = req.query.service_request_id;
    const items = await RequestItem.findAll({
      where,
      include: [
        { model: ServiceRequest, as: 'service_request' },
        { model: ScreenType, as: 'screen_type' }
      ],
      order: [['id', 'ASC']]
    });
    return res.json(items);
  } catch (error) { return next(error); }
}

async function get(req, res, next) {
  try {
    const item = await RequestItem.findByPk(req.params.id, {
      include: [
        { model: ServiceRequest, as: 'service_request' },
        { model: ScreenType, as: 'screen_type' }
      ]
    });
    if (!item) return res.status(404).json({ message: 'Item não encontrado.' });
    return res.json(item);
  } catch (error) { return next(error); }
}

async function create(req, res, next) {
  try {
    const payload = { ...req.body };
    payload.total_price = Number(payload.total_price || (Number(payload.unit_price || 0) * Number(payload.quantity || 1))).toFixed(2);
    const item = await RequestItem.create(payload);
    await updateServiceRequestTotal(item.service_request_id);
    return res.status(201).json(item);
  } catch (error) { return next(error); }
}

async function update(req, res, next) {
  try {
    const item = await RequestItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item não encontrado.' });
    const payload = { ...req.body };
    if (payload.unit_price !== undefined || payload.quantity !== undefined) {
      payload.total_price = Number(
        Number(payload.unit_price ?? item.unit_price) * Number(payload.quantity ?? item.quantity)
      ).toFixed(2);
    }
    await item.update(payload);
    await updateServiceRequestTotal(item.service_request_id);
    return res.json(item);
  } catch (error) { return next(error); }
}

async function remove(req, res, next) {
  try {
    const item = await RequestItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item não encontrado.' });
    const serviceRequestId = item.service_request_id;
    await item.destroy();
    await updateServiceRequestTotal(serviceRequestId);
    return res.status(204).send();
  } catch (error) { return next(error); }
}

module.exports = { list, get, create, update, remove };
