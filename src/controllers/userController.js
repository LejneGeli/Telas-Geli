const bcrypt = require('bcrypt');
const { User } = require('../models');

const safeAttributes = ['id', 'name', 'email', 'role', 'created_at', 'updated_at'];

async function list(req, res, next) {
  try {
    const users = await User.findAll({ attributes: safeAttributes, order: [['id', 'ASC']] });
    return res.json(users);
  } catch (error) { return next(error); }
}

async function get(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id, { attributes: safeAttributes });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    return res.json(user);
  } catch (error) { return next(error); }
}

async function create(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email e password são obrigatórios.' });
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password_hash, role: role || 'attendant' });
    const safeUser = await User.findByPk(user.id, { attributes: safeAttributes });
    return res.status(201).json(safeUser);
  } catch (error) { return next(error); }
}

async function update(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    const payload = { ...req.body };
    if (payload.password) {
      payload.password_hash = await bcrypt.hash(payload.password, 10);
      delete payload.password;
    }
    await user.update(payload);
    const safeUser = await User.findByPk(user.id, { attributes: safeAttributes });
    return res.json(safeUser);
  } catch (error) { return next(error); }
}

async function remove(req, res, next) {
  try {
    const deleted = await User.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Usuário não encontrado.' });
    return res.status(204).send();
  } catch (error) { return next(error); }
}

module.exports = { list, get, create, update, remove };
