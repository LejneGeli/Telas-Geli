const { ScreenType } = require('../models');

async function list(req, res, next) {
  try {
    const where = {};
    if (req.query.available === 'true') where.is_available = true;
    if (req.query.available === 'false') where.is_available = false;
    const screenTypes = await ScreenType.findAll({ where, order: [['id', 'ASC']] });
    return res.json(screenTypes);
  } catch (error) { return next(error); }
}

async function get(req, res, next) {
  try {
    const screenType = await ScreenType.findByPk(req.params.id);
    if (!screenType) return res.status(404).json({ message: 'Tipo de tela não encontrado.' });
    return res.json(screenType);
  } catch (error) { return next(error); }
}

async function create(req, res, next) {
  try {
    const screenType = await ScreenType.create(req.body);
    return res.status(201).json(screenType);
  } catch (error) { return next(error); }
}

async function update(req, res, next) {
  try {
    const screenType = await ScreenType.findByPk(req.params.id);
    if (!screenType) return res.status(404).json({ message: 'Tipo de tela não encontrado.' });
    await screenType.update(req.body);
    return res.json(screenType);
  } catch (error) { return next(error); }
}

async function remove(req, res, next) {
  try {
    const deleted = await ScreenType.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Tipo de tela não encontrado.' });
    return res.status(204).send();
  } catch (error) { return next(error); }
}

module.exports = { list, get, create, update, remove };
