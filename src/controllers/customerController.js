const { Customer, Address, ServiceRequest } = require('../models');

async function list(req, res, next) {
  try {
    const customers = await Customer.findAll({ order: [['id', 'ASC']] });
    return res.json(customers);
  } catch (error) { return next(error); }
}

async function get(req, res, next) {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      include: [
        { model: Address, as: 'addresses' },
        { model: ServiceRequest, as: 'service_requests' }
      ]
    });
    if (!customer) return res.status(404).json({ message: 'Cliente não encontrado.' });
    return res.json(customer);
  } catch (error) { return next(error); }
}

async function create(req, res, next) {
  try {
    const customer = await Customer.create(req.body);
    return res.status(201).json(customer);
  } catch (error) { return next(error); }
}

async function update(req, res, next) {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Cliente não encontrado.' });
    await customer.update(req.body);
    return res.json(customer);
  } catch (error) { return next(error); }
}

async function remove(req, res, next) {
  try {
    const deleted = await Customer.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Cliente não encontrado.' });
    return res.status(204).send();
  } catch (error) { return next(error); }
}

module.exports = { list, get, create, update, remove };
