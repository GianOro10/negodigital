const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Business = require('../models/Business');
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// ─── GET /api/users ─── (Admin: Listar usuarios)
router.get(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { role, city, active, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (city) query.city = new RegExp(city, 'i');
    if (active !== undefined) query.isActive = active === 'true';

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  })
);

// ─── GET /api/users/creators ─── (Público: Creadores disponibles)
router.get(
  '/creators',
  asyncHandler(async (req, res) => {
    const creators = await User.find({
      role: 'creator',
      isActive: true,
      isBlacklisted: false,
    })
      .select('name lastname city rating portfolio creatorStats')
      .sort('-rating');

    res.json({ success: true, data: creators });
  })
);

// ─── GET /api/users/scouts/leaderboard ───
router.get(
  '/scouts/leaderboard',
  asyncHandler(async (req, res) => {
    const scouts = await User.find({
      role: 'scout',
      isActive: true,
    })
      .select('name lastname city scoutStats')
      .sort('-scoutStats.approvedReports')
      .limit(20);

    res.json({ success: true, data: scouts });
  })
);

// ─── GET /api/users/:id ───
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
    }

    // Include user's businesses count
    const businessCount = await Business.countDocuments({
      $or: [
        { owner: user._id },
        { registeredBy: user._id },
        { assignedCreator: user._id },
      ],
    });

    res.json({
      success: true,
      data: { ...user.toObject(), businessCount },
    });
  })
);

// ─── PUT /api/users/:id/blacklist ─── (Admin)
router.put(
  '/:id/blacklist',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
    }

    user.isBlacklisted = !user.isBlacklisted;
    user.blacklistReason = req.body.reason || '';
    await user.save();

    res.json({
      success: true,
      data: user,
      message: user.isBlacklisted ? 'Usuario añadido a blacklist.' : 'Usuario removido de blacklist.',
    });
  })
);

// ─── DELETE /api/users/:id ─── (Admin o propio usuario para RGPD)
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    // Solo admin o el propio usuario (derecho al olvido RGPD)
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, error: 'No autorizado.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
    }

    // Soft delete
    user.isActive = false;
    user.email = `deleted_${user._id}@removed.com`;
    user.name = 'Usuario';
    user.lastname = 'Eliminado';
    user.phone = '';
    await user.save();

    res.json({ success: true, message: 'Datos personales eliminados (RGPD).' });
  })
);

module.exports = router;
