const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['task', 'workflow', 'template', 'optimization', 'user_activity', 'performance'],
    required: true
  },
  metric: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  unit: {
    type: String,
    enum: ['count', 'percentage', 'hours', 'minutes', 'days', 'currency', 'score'],
    default: 'count'
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    default: 'daily'
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  metadata: {
    category: String,
    subcategory: String,
    tags: [String],
    context: mongoose.Schema.Types.Mixed
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relatedItems: [{
    type: {
      type: String,
      enum: ['task', 'workflow', 'template', 'optimization']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedItems.type'
    }
  }]
}, {
  timestamps: true
});

analyticsSchema.index({ user: 1, type: 1, date: -1 });
analyticsSchema.index({ user: 1, metric: 1, date: -1 });
analyticsSchema.index({ user: 1, period: 1, date: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema); 