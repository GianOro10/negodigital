const mongoose = require('mongoose');

const DisputeSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    against: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      enum: [
        'quality_issues',
        'deadline_missed',
        'scope_disagreement',
        'payment_issue',
        'communication',
        'other',
      ],
      required: true,
    },
    description: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      minlength: [20, 'Describe el problema con al menos 20 caracteres'],
    },
    evidence: [String], // URLs de evidencia
    // RN: Mediación en 48h
    status: {
      type: String,
      enum: ['open', 'under_review', 'mediation', 'resolved', 'escalated'],
      default: 'open',
    },
    mediationDeadline: Date, // RN: 48h desde apertura
    resolution: {
      decision: String,
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      resolvedAt: Date,
      notes: String,
    },
  },
  { timestamps: true }
);

DisputeSchema.pre('save', function (next) {
  if (this.isNew) {
    this.mediationDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Dispute', DisputeSchema);
