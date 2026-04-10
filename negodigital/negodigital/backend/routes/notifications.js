const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// ─── GET /api/notifications ───
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { unread, page = 1, limit = 20 } = req.query;
    const query = { user: req.user._id };
    if (unread === 'true') query.isRead = false;

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .populate('relatedBusiness', 'name slug')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  })
);

// ─── PUT /api/notifications/:id/read ───
router.put(
  '/:id/read',
  protect,
  asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notificación no encontrada.' });
    }

    res.json({ success: true, data: notification });
  })
);

// ─── PUT /api/notifications/read-all ───
router.put(
  '/read-all',
  protect,
  asyncHandler(async (req, res) => {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas.' });
  })
);

module.exports = router;
