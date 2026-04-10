require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Business = require('../models/Business');
const connectDB = require('../config/db');

const seedData = async () => {
  await connectDB();

  console.log('🗑️  Limpiando base de datos...');
  await User.deleteMany({});
  await Business.deleteMany({});

  console.log('👤 Creando usuarios...');
  const hashedPassword = await bcrypt.hash('Password123', 12);

  const users = await User.insertMany([
    {
      name: 'Admin', lastname: 'NegoDigital', email: 'admin@negodigital.com',
      password: hashedPassword, role: 'admin', city: 'CDMX',
    },
    {
      name: 'Roberto', lastname: 'Méndez', email: 'roberto@email.com',
      password: hashedPassword, role: 'owner', city: 'CDMX',
    },
    {
      name: 'Carlos', lastname: 'Herrera', email: 'carlos@email.com',
      password: hashedPassword, role: 'scout', city: 'CDMX',
      scoutStats: { totalReports: 40, approvedReports: 35, totalEarnings: 1450 },
    },
    {
      name: 'Laura', lastname: 'Jiménez', email: 'laura@email.com',
      password: hashedPassword, role: 'creator', city: 'Guadalajara',
      portfolio: [
        { title: 'Web Restaurante Oaxaca', url: 'https://example.com/1', description: 'Landing page' },
        { title: 'Tienda Online Artesanías', url: 'https://example.com/2', description: 'E-commerce' },
        { title: 'Web Clínica Dental', url: 'https://example.com/3', description: 'Sitio corporativo' },
      ],
      creatorStats: { totalProjects: 18, completedProjects: 16, activeProjects: 2, averageRating: 4.8 },
      rating: 4.8,
    },
    {
      name: 'Digital', lastname: 'Solutions', email: 'agency@email.com',
      password: hashedPassword, role: 'agency', city: 'Monterrey',
      agencyInfo: { companyName: 'Digital Solutions SA de CV', taxId: 'DSO201905ABC', isVerified: true },
      rating: 4.5,
    },
  ]);

  const [admin, owner, scout, creator, agency] = users;

  console.log('🏪 Creando negocios...');
  await Business.insertMany([
    {
      name: 'Taquería Don Pancho', slug: 'taqueria-don-pancho-abc123',
      category: 'gastronomia', description: 'Tacos al pastor y suadero desde 1998.',
      address: { street: 'Calle Orizaba 42, Col. Roma Norte', city: 'CDMX', state: 'CDMX', country: 'México' },
      location: { type: 'Point', coordinates: [-99.1613, 19.4136] },
      phone: '+525512345678', photos: ['/uploads/taqueria1.jpg', '/uploads/taqueria2.jpg', '/uploads/taqueria3.jpg'],
      owner: owner._id, registeredBy: owner._id,
      status: 'verified', tags: ['tacos', 'comida', 'local'],
      consent: { type: 'owner', givenAt: new Date() },
      verification: { hasExistingWeb: false, verifiedAt: new Date(), verifiedBy: admin._id },
    },
    {
      name: 'Barbería El Clásico', slug: 'barberia-el-clasico-def456',
      category: 'servicios', description: 'Barbería tradicional con 30 años de experiencia.',
      address: { street: 'Av. Chapultepec 120, Col. Americana', city: 'Guadalajara', state: 'Jalisco', country: 'México' },
      location: { type: 'Point', coordinates: [-103.3621, 20.6712] },
      phone: '+523312345678', photos: ['/uploads/barberia1.jpg'],
      registeredBy: scout._id, status: 'verified',
      tags: ['barbería', 'cortes', 'tradicional'],
      consent: { type: 'verbal', givenAt: new Date() },
      verification: { hasExistingWeb: false, verifiedAt: new Date(), verifiedBy: admin._id },
    },
    {
      name: 'Farmacia San Ángel', slug: 'farmacia-san-angel-ghi789',
      category: 'salud', description: 'Farmacia familiar con genéricos y naturistas.',
      address: { street: 'Av. Constitución 890, Col. Del Valle', city: 'Monterrey', state: 'Nuevo León', country: 'México' },
      location: { type: 'Point', coordinates: [-100.3161, 25.6714] },
      phone: '+528112345678', photos: ['/uploads/farmacia1.jpg'],
      registeredBy: scout._id, status: 'pending_verification',
      tags: ['farmacia', 'salud', 'genéricos'],
      consent: { type: 'verbal', givenAt: new Date() },
    },
    {
      name: 'Florería Primavera', slug: 'floreria-primavera-jkl012',
      category: 'comercio', description: 'Arreglos florales para todo evento.',
      address: { street: 'Calle 5 de Mayo 34, Centro Histórico', city: 'Puebla', state: 'Puebla', country: 'México' },
      location: { type: 'Point', coordinates: [-98.1983, 19.0414] },
      phone: '+522212345678', photos: ['/uploads/floreria1.jpg', '/uploads/floreria2.jpg', '/uploads/floreria3.jpg'],
      registeredBy: scout._id, status: 'in_progress',
      assignedCreator: creator._id,
      tags: ['flores', 'eventos', 'arreglos'],
      consent: { type: 'written', givenAt: new Date() },
      verification: { hasExistingWeb: false, verifiedAt: new Date(), verifiedBy: admin._id },
      webProject: {
        plan: 'professional', price: 299,
        startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      },
    },
    {
      name: 'Taller Hermanos Ruiz', slug: 'taller-hermanos-ruiz-mno345',
      category: 'servicios', description: 'Mecánica automotriz general y especializada en VW.',
      address: { street: 'Calle Xola 567, Col. Narvarte', city: 'CDMX', state: 'CDMX', country: 'México' },
      location: { type: 'Point', coordinates: [-99.1545, 19.3913] },
      phone: '+525598765432', photos: ['/uploads/taller1.jpg'],
      registeredBy: scout._id, status: 'published',
      assignedCreator: creator._id,
      tags: ['mecánica', 'autos', 'VW'],
      consent: { type: 'owner', givenAt: new Date() },
      verification: { hasExistingWeb: false, verifiedAt: new Date(), verifiedBy: admin._id },
      webProject: {
        plan: 'starter', price: 99, websiteUrl: 'https://tallerhermanosruiz.com',
        lighthouseScore: 92, hasSSL: true, isResponsive: true, hasSEO: true,
        startedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        deliveredAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      metrics: {
        totalVisits: 342, phoneClicks: 67, directionRequests: 45,
        monthlyData: [
          { month: '2026-03', visits: 342, phoneClicks: 67, directionRequests: 45 },
        ],
      },
    },
    {
      name: 'Panadería La Espiga', slug: 'panaderia-la-espiga-pqr678',
      category: 'gastronomia', description: 'Pan artesanal oaxaqueño, chocolate de metate.',
      address: { street: 'Calle Reforma 23, Col. Reforma', city: 'Oaxaca', state: 'Oaxaca', country: 'México' },
      location: { type: 'Point', coordinates: [-96.7266, 17.0654] },
      phone: '+529512345678', photos: ['/uploads/panaderia1.jpg'],
      registeredBy: scout._id, status: 'verified',
      tags: ['pan', 'artesanal', 'tradición'],
      consent: { type: 'verbal', givenAt: new Date() },
      verification: { hasExistingWeb: false, verifiedAt: new Date(), verifiedBy: admin._id },
    },
  ]);

  console.log(`
  ✅ Seed completado:
     - ${users.length} usuarios creados
     - 6 negocios creados
     
  📧 Credenciales de prueba:
     Admin:   admin@negodigital.com / Password123
     Owner:   roberto@email.com / Password123
     Scout:   carlos@email.com / Password123
     Creator: laura@email.com / Password123
     Agency:  agency@email.com / Password123
  `);

  process.exit(0);
};

seedData().catch((err) => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});
