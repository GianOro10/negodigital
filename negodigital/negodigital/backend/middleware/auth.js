const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware: Verificar token JWT
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado. Token no proporcionado.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado.',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Cuenta desactivada. Contacta soporte.',
      });
    }

    if (user.isBlacklisted) {
      return res.status(403).json({
        success: false,
        error: `Cuenta suspendida: ${user.blacklistReason || 'Contacta soporte.'}`,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido o expirado.',
    });
  }
};

/**
 * Middleware: Autorizar por roles
 * @param  {...string} roles - Roles permitidos
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Rol '${req.user.role}' no tiene permisos para esta acción.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
