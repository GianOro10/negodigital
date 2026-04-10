/**
 * Middleware: Manejo centralizado de errores
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log para desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // Mongoose: ID inválido
  if (err.name === 'CastError') {
    error.message = 'Recurso no encontrado';
    return res.status(404).json({ success: false, error: error.message });
  }

  // Mongoose: Duplicado (unique)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `Ya existe un registro con ese ${field}`;
    return res.status(400).json({ success: false, error: error.message });
  }

  // Mongoose: Validación
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, errors: messages });
  }

  // JWT expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: 'Token expirado' });
  }

  // JWT inválido
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: 'Token inválido' });
  }

  // Default
  res.status(err.statusCode || 500).json({
    success: false,
    error: error.message || 'Error interno del servidor',
  });
};

/**
 * Wrapper async para evitar try-catch en cada controlador
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, asyncHandler };
