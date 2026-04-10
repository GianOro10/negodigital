const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { registerRules, loginRules, validate } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');

// ─── POST /api/auth/register ───
router.post(
  '/register',
  registerRules,
  validate,
  asyncHandler(async (req, res) => {
    const { name, lastname, email, password, role, city, phone } = req.body;

    // Verificar si email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe una cuenta con ese email.',
      });
    }

    const user = await User.create({
      name,
      lastname,
      email,
      password,
      role,
      city,
      phone,
    });

    const token = user.generateToken();

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          lastname: user.lastname,
          email: user.email,
          role: user.role,
          city: user.city,
          fullName: user.fullName,
        },
        token,
      },
    });
  })
);

// ─── POST /api/auth/login ───
router.post(
  '/login',
  loginRules,
  validate,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Cuenta desactivada.',
      });
    }

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = user.generateToken();

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          lastname: user.lastname,
          email: user.email,
          role: user.role,
          city: user.city,
          fullName: user.fullName,
          rating: user.rating,
        },
        token,
      },
    });
  })
);

// ─── GET /api/auth/me ───
router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: user,
    });
  })
);

// ─── PUT /api/auth/me ───
router.put(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const allowedFields = ['name', 'lastname', 'city', 'phone', 'avatar'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Agency-specific fields
    if (req.user.role === 'agency' && req.body.agencyInfo) {
      updates.agencyInfo = req.body.agencyInfo;
    }

    // Creator portfolio
    if (req.user.role === 'creator' && req.body.portfolio) {
      updates.portfolio = req.body.portfolio;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: user,
    });
  })
);

// ─── PUT /api/auth/password ───
router.put(
  '/password',
  protect,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Proporciona la contraseña actual y la nueva.',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'La nueva contraseña debe tener al menos 8 caracteres.',
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Contraseña actual incorrecta.',
      });
    }

    user.password = newPassword;
    await user.save();

    const token = user.generateToken();

    res.json({
      success: true,
      data: { token },
      message: 'Contraseña actualizada.',
    });
  })
);

module.exports = router;
