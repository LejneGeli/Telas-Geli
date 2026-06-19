const { MeasurementVisit, ServiceRequest, User } = require('../models');

async function list(req, res, next) {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.professional_id) where.professional_id = req.query.professional_id;
    const visits = await MeasurementVisit.findAll({
      where,
      include: [
        { model: ServiceRequest, as: 'service_request' },
        { model: User, as: 'professional', attributes: ['id', 'name', 'email', 'role'] }
      ],
      order: [['scheduled_date', 'ASC']]
    });
    return res.json(visits);
  } catch (error) { return next(error); }
}

async function get(req, res, next) {
  try {
    const visit = await MeasurementVisit.findByPk(req.params.id, {
      include: [
        { model: ServiceRequest, as: 'service_request' },
        { model: User, as: 'professional', attributes: ['id', 'name', 'email', 'role'] }
      ]
    });
    if (!visit) return res.status(404).json({ message: 'Visita não encontrada.' });
    return res.json(visit);
  } catch (error) { return next(error); }
}

async function create(req, res, next) {
  try {
    const visit = await MeasurementVisit.create(req.body);
    await ServiceRequest.update({ status: 'waiting_measurement', measurement_required: true }, { where: { id: visit.service_request_id } });
    return res.status(201).json(visit);
  } catch (error) { return next(error); }
}

async function update(req, res, next) {
  try {
    const visit = await MeasurementVisit.findByPk(req.params.id);
    if (!visit) return res.status(404).json({ message: 'Visita não encontrada.' });
    await visit.update(req.body);
    if (req.body.status === 'completed') {
      await ServiceRequest.update({ status: 'measured' }, { where: { id: visit.service_request_id } });
    }
    return res.json(visit);
  } catch (error) { return next(error); }
}

async function remove(req, res, next) {
  try {
    const deleted = await MeasurementVisit.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Visita não encontrada.' });
    return res.status(204).send();
  } catch (error) { return next(error); }
}

module.exports = { list, get, create, update, remove };
