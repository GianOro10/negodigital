const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    payee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'El monto es obligatorio'],
      min: [0, 'El monto no puede ser negativo'],
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'MXN', 'EUR'],
    },
    type: {
      type: String,
      enum: ['project_payment', 'scout_commission', 'refund'],
      required: true,
    },
    // RN: Sistema escrow - pago retenido hasta aprobación
    escrowStatus: {
      type: String,
      enum: ['held', 'released', 'refunded', 'disputed'],
      default: 'held',
    },
    // RN: Liberación automática 48h sin respuesta del dueño
    escrowDeadline: {
      type: Date,
    },
    releasedAt: Date,
    // Scout commission (10%)
    scoutCommission: {
      scout: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      amount: Number,
      paid: { type: Boolean, default: false },
    },
    plan: {
      type: String,
      enum: ['starter', 'professional', 'enterprise'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

TransactionSchema.index({ business: 1 });
TransactionSchema.index({ payer: 1 });
TransactionSchema.index({ payee: 1 });
TransactionSchema.index({ escrowStatus: 1 });
TransactionSchema.index({ status: 1 });

// Calculate scout commission (10%)
TransactionSchema.pre('save', function (next) {
  if (
    this.isNew &&
    this.type === 'project_payment' &&
    this.scoutCommission?.scout
  ) {
    this.scoutCommission.amount = this.amount * 0.1; // RN: 10% comisión scout
  }
  // Set escrow deadline to 48h from now
  if (this.isNew && this.escrowStatus === 'held') {
    this.escrowDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000); // RN: 48h
  }
  next();
});

module.exports = mongoose.model('Transaction', TransactionSchema);
