const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [50, 'El nombre no puede exceder 50 caracteres'],
    },
    lastname: {
      type: String,
      required: [true, 'El apellido es obligatorio'],
      trim: true,
      minlength: [2, 'El apellido debe tener al menos 2 caracteres'],
      maxlength: [50, 'El apellido no puede exceder 50 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Introduce un email válido'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
      select: false, // No incluir en queries por defecto
    },
    role: {
      type: String,
      enum: {
        values: ['owner', 'scout', 'creator', 'agency', 'admin'],
        message: 'Rol {VALUE} no es válido',
      },
      required: [true, 'El rol es obligatorio'],
    },
    city: {
      type: String,
      required: [true, 'La ciudad es obligatoria'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    // Campos específicos por rol
    portfolio: [
      {
        title: String,
        url: String,
        description: String,
      },
    ],
    // Scout stats
    scoutStats: {
      totalReports: { type: Number, default: 0 },
      approvedReports: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
    },
    // Creator stats
    creatorStats: {
      totalProjects: { type: Number, default: 0 },
      completedProjects: { type: Number, default: 0 },
      activeProjects: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
    },
    // Agency verification
    agencyInfo: {
      companyName: String,
      taxId: String,
      isVerified: { type: Boolean, default: false },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlacklisted: {
      type: Boolean,
      default: false,
    },
    blacklistReason: String,
    lastLogin: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ───
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ city: 1 });
UserSchema.index({ isActive: 1 });

// ─── Virtual: fullName ───
UserSchema.virtual('fullName').get(function () {
  return `${this.name} ${this.lastname}`;
});

// ─── Pre-save: Hash password ───
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Method: Compare password ───
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ─── Method: Generate JWT ───
UserSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      email: this.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// ─── Method: Check if creator can take more projects ───
UserSchema.methods.canTakeProject = function () {
  if (this.role !== 'creator') return false;
  return this.creatorStats.activeProjects < 3; // RN: Máximo 3 proyectos simultáneos
};

// ─── Static: Find active by role ───
UserSchema.statics.findByRole = function (role) {
  return this.find({ role, isActive: true, isBlacklisted: false });
};

module.exports = mongoose.model('User', UserSchema);
