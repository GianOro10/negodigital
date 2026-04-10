const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const { businessRules, assignProjectRules, reviewRules, paginationRules, validate } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');

// ─── GET /api/businesses ─── (Público: Directorio)
router.get(
  '/',
  paginationRules,
  validate,
  asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 12,
      category,
      city,
      status,
      search,
      sort = '-createdAt',
    } = req.query;

    const query = { isActive: true };

    if (category) query.category = category;
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (status) query.status = status;
    if (search) {
      query.$text = { $search: search };
    }

    const total = await Business.countDocuments(query);
    const businesses = await Business.find(query)
      .populate('owner', 'name lastname')
      .populate('registeredBy', 'name lastname')
      .populate('assignedCreator', 'name lastname rating')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: businesses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  })
);

// ─── GET /api/businesses/:id ───
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const business = await Business.findById(req.params.id)
      .populate('owner', 'name lastname email phone city')
      .populate('registeredBy', 'name lastname')
      .populate('assignedCreator', 'name lastname rating portfolio')
      .populate('reviews.user', 'name lastname');

    if (!business) {
      return res.status(404).json({ success: false, error: 'Negocio no encontrado.' });
    }

    res.json({ success: true, data: business });
  })
);

// ─── POST /api/businesses ─── (Scout u Owner)
router.post(
  '/',
  protect,
  authorize('owner', 'scout', 'admin'),
  businessRules,
  validate,
  asyncHandler(async (req, res) => {
    const user = req.user;

    // ══════════════════════════════════════════
    // RN: Scout máximo 5 reportes/día
    // ══════════════════════════════════════════
    if (user.role === 'scout') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayReports = await Business.countDocuments({
        registeredBy: user._id,
        createdAt: { $gte: today },
      });

      if (todayReports >= parseInt(process.env.SCOUT_DAILY_LIMIT || 5)) {
        return res.status(429).json({
          success: false,
          error: `Límite diario alcanzado (${process.env.SCOUT_DAILY_LIMIT || 5} reportes/día).`,
        });
      }
    }

    // ══════════════════════════════════════════
    // RN: Verificar duplicados por geolocalización (50m)
    // ══════════════════════════════════════════
    if (req.body.location?.coordinates) {
      const [lng, lat] = req.body.location.coordinates;
      const duplicates = await Business.findNearDuplicates(lng, lat, req.body.name);
      if (duplicates.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Ya existe un negocio similar en esa ubicación.',
          duplicates: duplicates.map((d) => ({
            id: d._id,
            name: d.name,
            address: d.address,
          })),
        });
      }
    }

    // Crear negocio
    const businessData = {
      ...req.body,
      registeredBy: user._id,
      owner: user.role === 'owner' ? user._id : req.body.owner || null,
      status: 'pending_verification',
      consent: {
        type: user.role === 'owner' ? 'owner' : req.body.consent?.type || 'pending',
        givenAt: new Date(),
      },
    };

    const business = await Business.create(businessData);

    // Actualizar stats del scout
    if (user.role === 'scout') {
      await User.findByIdAndUpdate(user._id, {
        $inc: { 'scoutStats.totalReports': 1 },
      });
    }

    // Crear notificación
    await Notification.create({
      user: user._id,
      type: 'business_registered',
      title: 'Negocio registrado',
      message: `"${business.name}" registrado exitosamente. Pendiente de verificación.`,
      relatedBusiness: business._id,
    });

    res.status(201).json({
      success: true,
      data: business,
      message: 'Negocio registrado. Será verificado en las próximas 24h.',
    });
  })
);

// ─── PUT /api/businesses/:id ─── (Owner o Admin)
router.put(
  '/:id',
  protect,
  authorize('owner', 'admin'),
  asyncHandler(async (req, res) => {
    let business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ success: false, error: 'Negocio no encontrado.' });
    }

    // Solo el dueño o admin puede editar
    if (
      req.user.role !== 'admin' &&
      business.owner?.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para editar este negocio.',
      });
    }

    // No editar si está en progreso o publicado
    if (['in_progress', 'published'].includes(business.status) && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        error: 'No se puede editar un negocio con proyecto en curso.',
      });
    }

    const allowedFields = [
      'name', 'description', 'address', 'phone', 'email',
      'photos', 'tags', 'category',
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    business = await Business.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: business });
  })
);

// ─── POST /api/businesses/:id/verify ─── (Admin)
router.post(
  '/:id/verify',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ success: false, error: 'Negocio no encontrado.' });
    }

    if (business.status !== 'pending_verification') {
      return res.status(400).json({
        success: false,
        error: `No se puede verificar un negocio en estado "${business.status}".`,
      });
    }

    // ══════════════════════════════════════════
    // RN: Verificar que NO tenga web existente
    // ══════════════════════════════════════════
    const { hasExistingWeb, notes } = req.body;

    if (hasExistingWeb) {
      business.status = 'rejected';
      business.verification = {
        hasExistingWeb: true,
        verifiedAt: new Date(),
        verifiedBy: req.user._id,
        notes: notes || 'El negocio ya tiene presencia web.',
      };
      await business.save();

      return res.json({
        success: true,
        data: business,
        message: 'Negocio rechazado: ya tiene presencia web.',
      });
    }

    business.status = 'verified';
    business.verification = {
      hasExistingWeb: false,
      verifiedAt: new Date(),
      verifiedBy: req.user._id,
      notes,
    };
    await business.save();

    // Notificar al que registró
    await Notification.create({
      user: business.registeredBy,
      type: 'business_verified',
      title: 'Negocio verificado',
      message: `"${business.name}" ha sido verificado y está disponible para asignación.`,
      relatedBusiness: business._id,
    });

    res.json({
      success: true,
      data: business,
      message: 'Negocio verificado exitosamente.',
    });
  })
);

// ─── POST /api/businesses/:id/assign ─── (Creator o Admin)
router.post(
  '/:id/assign',
  protect,
  authorize('creator', 'agency', 'admin'),
  assignProjectRules,
  validate,
  asyncHandler(async (req, res) => {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ success: false, error: 'Negocio no encontrado.' });
    }

    if (business.status !== 'verified') {
      return res.status(400).json({
        success: false,
        error: 'Este negocio no está disponible para asignación.',
      });
    }

    // ══════════════════════════════════════════
    // RN: Creador máx. 3 proyectos simultáneos
    // ══════════════════════════════════════════
    if (req.user.role === 'creator' && !req.user.canTakeProject()) {
      return res.status(400).json({
        success: false,
        error: 'Ya tienes 3 proyectos activos. Completa uno antes de tomar otro.',
      });
    }

    // ══════════════════════════════════════════
    // RN: Creador debe tener portafolio ≥ 2
    // ══════════════════════════════════════════
    if (req.user.role === 'creator' && (!req.user.portfolio || req.user.portfolio.length < 2)) {
      return res.status(400).json({
        success: false,
        error: 'Necesitas al menos 2 proyectos en tu portafolio.',
      });
    }

    // ══════════════════════════════════════════
    // RN: Agencia debe tener rating ≥ 4.0
    // ══════════════════════════════════════════
    if (req.user.role === 'agency' && req.user.rating < 4.0) {
      return res.status(400).json({
        success: false,
        error: 'Rating mínimo 4.0 requerido para agencias.',
      });
    }

    const planPrices = {
      starter: 99,
      professional: 299,
      enterprise: 599,
    };

    // RN: Deadline máximo 14 días
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 14);

    business.status = 'assigned';
    business.assignedCreator = req.user._id;
    business.webProject = {
      plan: req.body.plan,
      price: planPrices[req.body.plan],
      startedAt: new Date(),
      deadline,
    };
    await business.save();

    // Actualizar stats del creador
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        'creatorStats.totalProjects': 1,
        'creatorStats.activeProjects': 1,
      },
    });

    // Notificaciones
    if (business.owner) {
      await Notification.create({
        user: business.owner,
        type: 'business_assigned',
        title: 'Creador asignado',
        message: `Un creador web ha sido asignado a "${business.name}".`,
        relatedBusiness: business._id,
      });
    }

    res.json({
      success: true,
      data: business,
      message: `Proyecto asignado. Deadline: ${deadline.toLocaleDateString('es-MX')}.`,
    });
  })
);

// ─── POST /api/businesses/:id/deliver ─── (Creator)
router.post(
  '/:id/deliver',
  protect,
  authorize('creator', 'agency'),
  asyncHandler(async (req, res) => {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ success: false, error: 'Negocio no encontrado.' });
    }

    if (business.assignedCreator?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'No eres el creador asignado.' });
    }

    if (!['assigned', 'in_progress', 'revision_requested'].includes(business.status)) {
      return res.status(400).json({ success: false, error: 'Estado no permite entrega.' });
    }

    const { websiteUrl, lighthouseScore, hasSSL, isResponsive, hasSEO } = req.body;

    if (!websiteUrl) {
      return res.status(400).json({ success: false, error: 'URL del sitio web obligatoria.' });
    }

    business.webProject.websiteUrl = websiteUrl;
    business.webProject.lighthouseScore = lighthouseScore;
    business.webProject.hasSSL = hasSSL;
    business.webProject.isResponsive = isResponsive;
    business.webProject.hasSEO = hasSEO;
    business.webProject.deliveredAt = new Date();
    business.status = 'in_review';

    // ══════════════════════════════════════════
    // RN: Verificar calidad mínima
    // ══════════════════════════════════════════
    if (!business.meetsQualityStandards()) {
      return res.status(400).json({
        success: false,
        error: 'La web no cumple estándares mínimos: Lighthouse ≥ 80, SSL, responsive, SEO.',
        requirements: {
          lighthouseScore: lighthouseScore >= 80 ? '✅' : '❌ Necesita ≥ 80',
          hasSSL: hasSSL ? '✅' : '❌ Falta SSL',
          isResponsive: isResponsive ? '✅' : '❌ No es responsive',
          hasSEO: hasSEO ? '✅' : '❌ Falta SEO básico',
        },
      });
    }

    await business.save();

    res.json({
      success: true,
      data: business,
      message: 'Entrega recibida. Pendiente de revisión por admin.',
    });
  })
);

// ─── POST /api/businesses/:id/approve ─── (Admin)
router.post(
  '/:id/approve',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ success: false, error: 'Negocio no encontrado.' });
    }

    if (business.status !== 'in_review') {
      return res.status(400).json({ success: false, error: 'El negocio no está en revisión.' });
    }

    const { approved, notes } = req.body;

    if (approved) {
      business.status = 'approved';
      business.webProject.publishedAt = new Date();

      // Actualizar stats del creador
      await User.findByIdAndUpdate(business.assignedCreator, {
        $inc: {
          'creatorStats.completedProjects': 1,
          'creatorStats.activeProjects': -1,
        },
      });

      // Notificar
      await Notification.create({
        user: business.assignedCreator,
        type: 'project_approved',
        title: 'Proyecto aprobado',
        message: `El sitio web de "${business.name}" ha sido aprobado.`,
        relatedBusiness: business._id,
      });
    } else {
      business.status = 'revision_requested';
      business.webProject.revisionCount += 1;

      // ══════════════════════════════════════════
      // RN: Blacklist tras 3 entregas rechazadas
      // ══════════════════════════════════════════
      if (business.webProject.revisionCount >= 3) {
        await User.findByIdAndUpdate(business.assignedCreator, {
          isBlacklisted: true,
          blacklistReason: '3 entregas rechazadas consecutivas.',
        });
      }
    }

    await business.save();

    res.json({
      success: true,
      data: business,
      message: approved ? 'Proyecto aprobado.' : 'Revisión solicitada al creador.',
    });
  })
);

// ─── POST /api/businesses/:id/publish ─── (Admin)
router.post(
  '/:id/publish',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const business = await Business.findById(req.params.id);
    if (!business || business.status !== 'approved') {
      return res.status(400).json({ success: false, error: 'Solo se publican negocios aprobados.' });
    }

    business.status = 'published';
    business.webProject.publishedAt = new Date();
    await business.save();

    // Notificar al dueño
    if (business.owner) {
      await Notification.create({
        user: business.owner,
        type: 'project_published',
        title: '¡Tu web está en vivo!',
        message: `"${business.name}" ya tiene su web publicada: ${business.webProject.websiteUrl}`,
        relatedBusiness: business._id,
      });
    }

    res.json({ success: true, data: business, message: 'Sitio web publicado.' });
  })
);

// ─── POST /api/businesses/:id/reviews ───
router.post(
  '/:id/reviews',
  protect,
  reviewRules,
  validate,
  asyncHandler(async (req, res) => {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ success: false, error: 'Negocio no encontrado.' });
    }

    // Verificar que no haya dejado reseña ya
    const existingReview = business.reviews.find(
      (r) => r.user.toString() === req.user.id
    );
    if (existingReview) {
      return res.status(400).json({ success: false, error: 'Ya dejaste una reseña.' });
    }

    business.reviews.push({
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    await business.save();

    // Notificar al dueño
    if (business.owner) {
      await Notification.create({
        user: business.owner,
        type: 'review_received',
        title: 'Nueva reseña',
        message: `Tu negocio "${business.name}" recibió una reseña de ${req.body.rating} estrellas.`,
        relatedBusiness: business._id,
      });
    }

    res.status(201).json({ success: true, data: business.reviews });
  })
);

// ─── DELETE /api/businesses/:id ─── (Admin)
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ success: false, error: 'Negocio no encontrado.' });
    }

    // ══════════════════════════════════════════
    // RN: No eliminar sin notificación previa 30 días
    // ══════════════════════════════════════════
    if (!business.deletionNoticeDate) {
      business.deletionNoticeDate = new Date();
      business.isActive = false;
      await business.save();

      return res.json({
        success: true,
        message: 'Negocio marcado para eliminación. Se eliminará en 30 días.',
      });
    }

    const daysSinceNotice = (Date.now() - business.deletionNoticeDate) / (1000 * 60 * 60 * 24);
    if (daysSinceNotice < 30) {
      return res.status(400).json({
        success: false,
        error: `Faltan ${Math.ceil(30 - daysSinceNotice)} días para poder eliminar.`,
      });
    }

    await business.deleteOne();
    res.json({ success: true, message: 'Negocio eliminado permanentemente.' });
  })
);

// ─── GET /api/businesses/:id/metrics ─── (Owner)
router.get(
  '/:id/metrics',
  protect,
  asyncHandler(async (req, res) => {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ success: false, error: 'Negocio no encontrado.' });
    }

    // ══════════════════════════════════════════
    // RN: Solo el dueño ve métricas (RGPD)
    // ══════════════════════════════════════════
    if (req.user.role !== 'admin' && business.owner?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Solo el dueño puede ver las métricas.',
      });
    }

    res.json({ success: true, data: business.metrics });
  })
);

module.exports = router;
