function adminOnly(req, res, next) {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'TEACHER')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = adminOnly;
