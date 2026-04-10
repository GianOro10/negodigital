require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// ─── Initialize Express ───
const app = express();

// ─── Connect Database ───
connectDB();

// ─── Security Middleware ───
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ───
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || 100),
  message: {
    success: false,
    error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Auth endpoint has stricter limits
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: 'Demasiados intentos de login. Espera 15 minutos.',
  },
});
app.use('/api/auth/login', authLimiter);

// ─── Body Parsers ───
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ───
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ─── Static Files ───
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ───
app.use('/api/auth', require('./routes/auth'));
app.use('/api/businesses', require('./routes/businesses'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));

// ─── Health Check ───
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'NegoDigital API funcionando',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── API Docs Endpoint ───
app.get('/api', (req, res) => {
  res.json({
    name: 'NegoDigital API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Crear cuenta',
        'POST /api/auth/login': 'Iniciar sesión',
        'GET /api/auth/me': 'Perfil actual (auth)',
        'PUT /api/auth/me': 'Actualizar perfil (auth)',
        'PUT /api/auth/password': 'Cambiar contraseña (auth)',
      },
      businesses: {
        'GET /api/businesses': 'Listar negocios (público)',
        'GET /api/businesses/:id': 'Detalle negocio (público)',
        'POST /api/businesses': 'Registrar negocio (auth: owner/scout)',
        'PUT /api/businesses/:id': 'Editar negocio (auth: owner/admin)',
        'POST /api/businesses/:id/verify': 'Verificar (auth: admin)',
        'POST /api/businesses/:id/assign': 'Asignar creador (auth: creator/agency)',
        'POST /api/businesses/:id/deliver': 'Entregar web (auth: creator)',
        'POST /api/businesses/:id/approve': 'Aprobar entrega (auth: admin)',
        'POST /api/businesses/:id/publish': 'Publicar web (auth: admin)',
        'POST /api/businesses/:id/reviews': 'Dejar reseña (auth)',
        'GET /api/businesses/:id/metrics': 'Métricas (auth: owner)',
        'DELETE /api/businesses/:id': 'Eliminar (auth: admin)',
      },
      users: {
        'GET /api/users': 'Listar usuarios (auth: admin)',
        'GET /api/users/creators': 'Creadores disponibles (público)',
        'GET /api/users/scouts/leaderboard': 'Top scouts (público)',
        'GET /api/users/:id': 'Perfil usuario (público)',
        'PUT /api/users/:id/blacklist': 'Blacklist toggle (auth: admin)',
        'DELETE /api/users/:id': 'Eliminar cuenta RGPD (auth)',
      },
      notifications: {
        'GET /api/notifications': 'Mis notificaciones (auth)',
        'PUT /api/notifications/:id/read': 'Marcar leída (auth)',
        'PUT /api/notifications/read-all': 'Marcar todas leídas (auth)',
      },
    },
  });
});

// ─── Serve Frontend in Production ───
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// ─── 404 Handler ───
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Ruta ${req.originalUrl} no encontrada.`,
  });
});

// ─── Error Handler ───
app.use(errorHandler);

// ─── Start Server ───
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🚀 NegoDigital API v1.0               ║
  ║   Puerto: ${PORT}                           ║
  ║   Entorno: ${process.env.NODE_ENV || 'development'}              ║
  ║   API Docs: http://localhost:${PORT}/api    ║
  ╚══════════════════════════════════════════╝
  `);
});

module.exports = app;
