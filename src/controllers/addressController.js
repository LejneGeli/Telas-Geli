const { Address, Customer } = require('../models');

async function list(req, res, next) {
  try {
    const addresses = await Address.findAll({ include: [{ model: Customer, as: 'customer' }], order: [['id', 'ASC']] });
    return res.json(addresses);
  } catch (error) { return next(error); }
}

async function get(req, res, next) {
  try {
    const address = await Address.findByPk(req.params.id, { include: [{ model: Customer, as: 'customer' }] });
    if (!address) return res.status(404).json({ message: 'Endereço não encontrado.' });
    return res.json(address);
  } catch (error) { return next(error); }
}

async function create(req, res, next) {
  try {
    const address = await Address.create(req.body);
    return res.status(201).json(address);
  } catch (error) { return next(error); }
}

async function update(req, res, next) {
  try {
    const address = await Address.findByPk(req.params.id);
    if (!address) return res.status(404).json({ message: 'Endereço não encontrado.' });
    await address.update(req.body);
    return res.json(address);
  } catch (error) { return next(error); }
}

async function remove(req, res, next) {
  try {
    const deleted = await Address.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Endereço não encontrado.' });
    return res.status(204).send();
  } catch (error) { return next(error); }
}

module.exports = { list, get, create, update, remove };
