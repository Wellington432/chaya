const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../database/prismaClient');
const config = require('../config');
const { cleanText } = require('../utils/sanitize');

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

exports.login = async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: 'error', message: error.details[0].message });
    }

    const email = cleanText(value.email);
    const password = cleanText(value.password);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Credenciais inválidas.' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ status: 'error', message: 'Credenciais inválidas.' });
    }

    const token = jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, { expiresIn: '8h' });

    res.json({ status: 'success', data: { token, user: { id: user.id, email: user.email, role: user.role } } });
  } catch (error) {
    next(error);
  }
};
