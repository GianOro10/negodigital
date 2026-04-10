const mongoose = require('mongoose');
const slugify = require('slugify');

const BusinessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del negocio es obligatorio'],
      trim: true,
      minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    slug: {
      type: String,
      unique: true,
    },
    category: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      enum: {
        values: [
          'gastronomia',
          'servicios',
          'comercio',
          'salud',
          'educacion',
          'entretenimiento',
          'tecnologia',
          'otros',
        ],
        message: 'Categoría {VALUE} no es válida',
      },
    },
    description: {
      type: String,
      maxlength: [1000, 'La descripción no puede exceder 1000 caracteres'],
    },
    // ─── Ubicación ───
    address: {
      street: {
        type: String,
        required: [true, 'La dirección es obligatoria'],
        minlength: [10, 'La dirección debe tener al menos 10 caracteres'],
      },
      city: {
        type: String,
        required: [true, 'La ciudad es obligatoria'],
      },
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'México',
      },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere',
      },
    },
    // ─── Contacto ───
    phone: {
      type: String,
      required: [true, 'El teléfono es obligatorio'],
      validate: {
        validator: function (v) {
          return v.replace(/\D/g, '').length >= 10;
        },
        message: 'El teléfono debe tener al menos 10 dígitos',
      },
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    // ─── Fotos ───
    photos: {
      type: [String],
      validate: {
        validator: function (v) {
          // RN: Mínimo 3 fotos cuando lo registra el dueño
          if (this.registeredBy?.toString() === this.owner?.toString()) {
            return v.length >= 3;
          }
          return v.length >= 1; // Scout: mínimo 1 (fachada)
        },
        message: 'Se requieren al menos 3 fotos del negocio',
      },
    },
    // ─── Relaciones ───
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedCreator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // ─── Estado del flujo ───
    status: {
      type: String,
      enum: {
        values: [
          'pending_verification', // Recién registrado
          'verified', // Verificado, listo para asignar
          'assigned', // Creador asignado
          'in_progress', // Web en desarrollo
          'in_review', // Entregado, pendiente revisión admin
          'revision_requested', // Admin pidió cambios
          'approved', // Admin aprobó
          'published', // Web publicada y en vivo
          'rejected', // Rechazado (no cumple requisitos)
          'cancelled', // Cancelado por dueño
        ],
        message: 'Estado {VALUE} no es válido',
      },
      default: 'pending_verification',
    },
    // ─── Verificación ───
    verification: {
      hasExistingWeb: {
        type: Boolean,
        default: null, // null = no verificado aún
      },
      webSearchResults: [String], // URLs encontradas en búsqueda
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      notes: String,
    },
    // ─── Consentimiento ───
    consent: {
      type: {
        type: String,
        enum: ['verbal', 'written', 'owner', 'pending'],
        default: 'pending',
      },
      givenAt: Date,
      document: String, // URL del documento de consentimiento
    },
    // ─── Proyecto web ───
    webProject: {
      plan: {
        type: String,
        enum: ['starter', 'professional', 'enterprise'],
      },
      price: Number,
      startedAt: Date,
      deadline: Date, // RN: Máximo 14 días desde asignación
      deliveredAt: Date,
      publishedAt: Date,
      websiteUrl: String,
      lighthouseScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      hasSSL: { type: Boolean, default: false },
      isResponsive: { type: Boolean, default: false },
      hasSEO: { type: Boolean, default: false },
      revisionCount: { type: Number, default: 0 },
    },
    // ─── Métricas post-lanzamiento ───
    metrics: {
      totalVisits: { type: Number, default: 0 },
      phoneClicks: { type: Number, default: 0 },
      directionRequests: { type: Number, default: 0 },
      monthlyData: [
        {
          month: String, // "2026-04"
          visits: Number,
          phoneClicks: Number,
          directionRequests: Number,
        },
      ],
    },
    // ─── Reseñas ───
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    // ─── Tags ───
    tags: [String],
    // ─── Metadata ───
    isActive: {
      type: Boolean,
      default: true,
    },
    deletionNoticeDate: Date, // RN: 30 días antes de eliminar
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ───
BusinessSchema.index({ slug: 1 });
BusinessSchema.index({ category: 1, status: 1 });
BusinessSchema.index({ 'address.city': 1 });
BusinessSchema.index({ status: 1 });
BusinessSchema.index({ owner: 1 });
BusinessSchema.index({ registeredBy: 1 });
BusinessSchema.index({ assignedCreator: 1 });
BusinessSchema.index({ location: '2dsphere' });
BusinessSchema.index({ name: 'text', description: 'text', tags: 'text' });

// ─── Pre-save: Generate slug ───
BusinessSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
    }) + '-' + this._id.toString().slice(-6);
  }
  next();
});

// ─── Pre-save: Calculate average rating ───
BusinessSchema.pre('save', function (next) {
  if (this.reviews && this.reviews.length > 0) {
    this.averageRating =
      this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length;
  }
  next();
});

// ─── Method: Check if web project meets quality standards ───
BusinessSchema.methods.meetsQualityStandards = function () {
  const wp = this.webProject;
  if (!wp) return false;
  return (
    wp.lighthouseScore >= 80 && // RN: Lighthouse ≥ 80
    wp.hasSSL === true && // RN: SSL obligatorio
    wp.isResponsive === true && // RN: Responsive obligatorio
    wp.hasSEO === true // RN: SEO básico obligatorio
  );
};

// ─── Method: Check if deadline passed ───
BusinessSchema.methods.isOverdue = function () {
  if (!this.webProject?.deadline) return false;
  return new Date() > this.webProject.deadline && this.status === 'in_progress';
};

// ─── Static: Find duplicates by location (50m radius) ───
BusinessSchema.statics.findNearDuplicates = function (longitude, latitude, name) {
  return this.find({
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: 50, // RN: 50 metros de radio anti-duplicados
      },
    },
    name: { $regex: new RegExp(name.split(' ')[0], 'i') },
    isActive: true,
  });
};

// ─── Static: Get available for creators ───
BusinessSchema.statics.getAvailableProjects = function () {
  return this.find({
    status: 'verified',
    isActive: true,
  })
    .populate('owner', 'name lastname city')
    .populate('registeredBy', 'name lastname')
    .sort('-createdAt');
};

module.exports = mongoose.model('Business', BusinessSchema);
