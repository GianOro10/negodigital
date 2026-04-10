# NegoDigital — Plataforma de Digitalización de Negocios Locales

> Descubre negocios sin presencia digital y créales su página web.

![Node](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7+-brightgreen)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📋 Descripción

**NegoDigital** es una plataforma fullstack que conecta negocios locales sin presencia digital con profesionales que pueden crearles su página web. Incluye sistema de roles, directorio público, panel de administración, sistema de pagos escrow, y métricas post-lanzamiento.

---

## 🏗️ Arquitectura

```
negodigital/
├── backend/                    # API REST (Node.js + Express + MongoDB)
│   ├── config/
│   │   └── db.js              # Conexión MongoDB con Mongoose
│   ├── middleware/
│   │   ├── auth.js            # JWT + autorización por roles
│   │   ├── validate.js        # Validación con express-validator
│   │   └── errorHandler.js    # Manejo centralizado de errores
│   ├── models/
│   │   ├── User.js            # Usuarios (5 roles)
│   │   ├── Business.js        # Negocios con flujo de estados
│   │   ├── Transaction.js     # Pagos escrow + comisiones
│   │   ├── Dispute.js         # Sistema de disputas
│   │   └── Notification.js    # Notificaciones en app
│   ├── routes/
│   │   ├── auth.js            # Register, login, profile
│   │   ├── businesses.js      # CRUD + flujo completo
│   │   ├── users.js           # Admin + RGPD
│   │   └── notifications.js   # Read/unread
│   ├── utils/
│   │   └── seed.js            # Datos de prueba
│   ├── server.js              # Entry point Express
│   ├── package.json
│   └── .env.example
├── frontend/                   # SPA (React 18 + Vite + Tailwind)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx     # Nav responsive con auth
│   │   │   ├── Footer.jsx
│   │   │   └── BusinessCard.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Landing con hero, features, pricing
│   │   │   ├── DirectoryPage.jsx   # Directorio con search + filtros
│   │   │   ├── BusinessDetailPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx   # Dashboard por rol
│   │   │   └── AddBusinessPage.jsx # Formulario con validación
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Estado global de auth
│   │   ├── hooks/
│   │   │   └── index.js           # useBusinesses, useForm
│   │   ├── utils/
│   │   │   └── api.js             # Axios + interceptors
│   │   ├── styles/
│   │   │   └── index.css          # Tailwind + custom styles
│   │   ├── App.jsx                # Router + protected routes
│   │   └── main.jsx               # Entry point React
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── package.json               # Monorepo scripts
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🛠️ Stack Tecnológico

### Backend
| Tecnología | Propósito |
|------------|-----------|
| **Node.js 18+** | Runtime |
| **Express 4** | Framework HTTP |
| **MongoDB + Mongoose** | Base de datos + ODM |
| **JWT (jsonwebtoken)** | Autenticación stateless |
| **bcryptjs** | Hash de contraseñas (12 rounds) |
| **express-validator** | Validación de inputs |
| **helmet** | Headers de seguridad |
| **cors** | Cross-Origin configurado |
| **express-rate-limit** | Protección contra brute force |
| **morgan** | Logging HTTP |
| **multer** | Upload de archivos |

### Frontend
| Tecnología | Propósito |
|------------|-----------|
| **React 18** | UI Library |
| **Vite 5** | Build tool (HMR) |
| **React Router 6** | Routing SPA |
| **Tailwind CSS 3** | Utility-first CSS |
| **Axios** | HTTP client |
| **Lucide React** | Iconos |
| **react-hot-toast** | Notificaciones |

---

## 👥 Roles del Sistema

| Rol | Permisos |
|-----|----------|
| **Owner** (Dueño) | Registrar su negocio, ver métricas, aprobar entregas |
| **Scout** | Reportar negocios sin web (máx 5/día), ganar comisión 10% |
| **Creator** (Creador) | Tomar proyectos (máx 3 activos), entregar webs |
| **Agency** (Agencia) | Gestionar múltiples proyectos, requiere rating ≥ 4.0 |
| **Admin** | Verificar, aprobar, moderar, blacklist, gestionar disputas |

---

## 📖 Historias de Usuario

### HU-001: Registro de negocio (Owner)
- Validar RFC/NIF y dirección real
- Mínimo 3 fotos del negocio
- Verificación automática de que no tiene web
- No registrar sin consentimiento

### HU-002: Descubrimiento (Scout)
- Foto de fachada + GPS obligatorio
- Verificación automática de no-web
- Máx. 5 reportes/día (anti-spam)
- No pagar duplicados (radio 50m)
- Comisión: 10% por digitalización

### HU-003: Creación de web (Creator)
- Portafolio verificado ≥ 2 proyectos
- Entrega máxima: 14 días
- Lighthouse ≥ 80 + SSL + responsive + SEO
- Máx. 3 proyectos simultáneos
- Pago liberado 48h post-aprobación

### HU-004: Gestión múltiple (Agency)
- Empresa legalmente constituida
- Dashboard con métricas en tiempo real
- Asignación por zona geográfica
- SLA respuesta < 24h
- Rating mínimo 4.0/5

### HU-005: Métricas (Owner post-lanzamiento)
- Visitas, clics teléfono, direcciones
- Comparativa mensual
- Notificaciones de reseñas
- Solo datos propios (RGPD)

### HU-006: Moderación (Admin)
- Revisión obligatoria pre-publicación
- Disputas con mediación 48h
- Blacklist automática: 3 rechazos
- Eliminación: 30 días de aviso previo

---

## ⚖️ Reglas de Negocio Implementadas

1. **Verificación de no-web**: Búsqueda automática antes de aprobar
2. **Consentimiento obligatorio**: Verificación del dueño
3. **Calidad mínima**: Lighthouse ≥ 80, SSL, responsive, SEO, WCAG
4. **Pagos Escrow**: Retenidos hasta aprobación, liberación auto 48h
5. **Anti-fraude**: Duplicados por geolocalización (50m) + nombre similar
6. **RGPD**: Datos cifrados, derecho al olvido, cookies con consentimiento
7. **SLA**: Verificación 24h, asignación 48h, entrega máx 14 días
8. **Rate limiting**: 100 req/15min general, 20 req/15min en login
9. **Blacklist**: Automática tras 3 entregas rechazadas
10. **Eliminación segura**: 30 días de aviso previo obligatorio

---

## 🚀 Instalación y Ejecución

### Requisitos previos
- Node.js ≥ 18
- MongoDB ≥ 7 (local o Atlas)
- npm o yarn

### 1. Clonar e instalar

```bash
git clone https://github.com/GianOro10/negodigital.git
cd negodigital
npm run install:all
```

### 2. Configurar variables de entorno

```bash
cp backend/.env.example backend/.env
# Editar backend/.env con tus valores
```

### 3. Poblar base de datos con datos de prueba

```bash
npm run seed
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Esto inicia:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:5000/api

### 5. Build para producción

```bash
npm run build
npm start
```

---

## 🔑 Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@negodigital.com | Password123 |
| Owner | roberto@email.com | Password123 |
| Scout | carlos@email.com | Password123 |
| Creator | laura@email.com | Password123 |
| Agency | agency@email.com | Password123 |

---

## 📡 API Endpoints

### Auth
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Crear cuenta | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/me` | Perfil actual | Sí |
| PUT | `/api/auth/me` | Actualizar perfil | Sí |
| PUT | `/api/auth/password` | Cambiar contraseña | Sí |

### Businesses
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/businesses` | Listar (filtros, paginación) | No |
| GET | `/api/businesses/:id` | Detalle | No |
| POST | `/api/businesses` | Registrar | Owner/Scout |
| PUT | `/api/businesses/:id` | Editar | Owner/Admin |
| POST | `/api/businesses/:id/verify` | Verificar | Admin |
| POST | `/api/businesses/:id/assign` | Asignar creador | Creator/Agency |
| POST | `/api/businesses/:id/deliver` | Entregar web | Creator |
| POST | `/api/businesses/:id/approve` | Aprobar/rechazar | Admin |
| POST | `/api/businesses/:id/publish` | Publicar | Admin |
| POST | `/api/businesses/:id/reviews` | Añadir reseña | Sí |
| GET | `/api/businesses/:id/metrics` | Métricas (RGPD) | Owner |
| DELETE | `/api/businesses/:id` | Eliminar (30d aviso) | Admin |

### Users
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/users` | Listar todos | Admin |
| GET | `/api/users/creators` | Creadores disponibles | No |
| GET | `/api/users/scouts/leaderboard` | Top scouts | No |
| PUT | `/api/users/:id/blacklist` | Toggle blacklist | Admin |
| DELETE | `/api/users/:id` | Eliminar (RGPD) | Propio/Admin |

---

## 📄 Licencia

MIT License — libre para uso comercial y personal.
