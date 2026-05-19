module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ status: 'error', message: 'Acesso negado. Apenas administradores.' });
  }
  next();
};
