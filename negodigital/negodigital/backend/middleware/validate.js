const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware: Ejecutar validaciones y retornar errores
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// ─── Auth Validations ───
const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 50 }).withMessage('Nombre: 2-50 caracteres'),
  body('lastname')
    .trim()
    .notEmpty().withMessage('El apellido es obligatorio')
    .isLength({ min: 2, max: 50 }).withMessage('Apellido: 2-50 caracteres'),
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Email no válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 8 }).withMessage('Mínimo 8 caracteres')
    .matches(/[A-Z]/).withMessage('Debe contener al menos una mayúscula')
    .matches(/\d/).withMessage('Debe contener al menos un número'),
  body('role')
    .notEmpty().withMessage('El rol es obligatorio')
    .isIn(['owner', 'scout', 'creator', 'agency']).withMessage('Rol no válido'),
  body('city')
    .trim()
    .notEmpty().withMessage('La ciudad es obligatoria'),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Email no válido'),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria'),
];

// ─── Business Validations ───
const businessRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre del negocio es obligatorio')
    .isLength({ min: 3, max: 100 }).withMessage('Nombre: 3-100 caracteres'),
  body('category')
    .notEmpty().withMessage('La categoría es obligatoria')
    .isIn([
      'gastronomia', 'servicios', 'comercio', 'salud',
      'educacion', 'entretenimiento', 'tecnologia', 'otros',
    ]).withMessage('Categoría no válida'),
  body('address.street')
    .trim()
    .notEmpty().withMessage('La dirección es obligatoria')
    .isLength({ min: 10 }).withMessage('Dirección: mínimo 10 caracteres'),
  body('address.city')
    .trim()
    .notEmpty().withMessage('La ciudad es obligatoria'),
  body('phone')
    .notEmpty().withMessage('El teléfono es obligatorio')
    .custom((value) => {
      if (value.replace(/\D/g, '').length < 10) {
        throw new Error('El teléfono debe tener al menos 10 dígitos');
      }
      return true;
    }),
  body('consent.type')
    .notEmpty().withMessage('El consentimiento es obligatorio')
    .isIn(['verbal', 'written', 'owner']).withMessage('Tipo de consentimiento no válido'),
];

// ─── Project Assignment Validations ───
const assignProjectRules = [
  param('id').isMongoId().withMessage('ID de negocio no válido'),
  body('plan')
    .notEmpty().withMessage('El plan es obligatorio')
    .isIn(['starter', 'professional', 'enterprise']).withMessage('Plan no válido'),
];

// ─── Review Validations ───
const reviewRules = [
  param('id').isMongoId().withMessage('ID no válido'),
  body('rating')
    .notEmpty().withMessage('La calificación es obligatoria')
    .isInt({ min: 1, max: 5 }).withMessage('Calificación: 1-5'),
  body('comment')
    .optional()
    .isLength({ max: 500 }).withMessage('Comentario: máximo 500 caracteres'),
];

// ─── Query Validations ───
const paginationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número positivo'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Límite: 1-50'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  businessRules,
  assignProjectRules,
  reviewRules,
  paginationRules,
};
