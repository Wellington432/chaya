const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../database/prismaClient');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'Token de autenticação não encontrado.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Usuário inválido.' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Token inválido ou expirado.' });
  }
};
