const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'business_registered',
        'business_verified',
        'business_assigned',
        'project_delivered',
        'project_approved',
        'project_published',
        'review_received',
        'payment_received',
        'commission_earned',
        'dispute_opened',
        'dispute_resolved',
        'deadline_warning',
        'blacklist_warning',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedBusiness: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
    isRead: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
