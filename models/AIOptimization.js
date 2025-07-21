const mongoose = require('mongoose');

const optimizationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['workflow', 'task', 'schedule', 'resource', 'automation'],
    required: true
  },
  category: {
    type: String,
    enum: ['efficiency', 'time_management', 'resource_allocation', 'automation', 'collaboration'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  suggestion: {
    type: String,
    required: true,
    trim: true
  },
  impact: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 75
  },
  estimatedSavings: {
    time: Number,
    cost: Number,
    efficiency: Number
  },
  status: {
    type: String,
    enum: ['pending', 'applied', 'rejected', 'in_progress'],
    default: 'pending'
  },
  appliedAt: Date,
  appliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  data: {
    currentMetrics: mongoose.Schema.Types.Mixed,
    suggestedMetrics: mongoose.Schema.Types.Mixed,
    analysis: mongoose.Schema.Types.Mixed
  },
  tags: [{
    type: String,
    trim: true
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relatedItems: [{
    type: {
      type: String,
      enum: ['task', 'workflow', 'template']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedItems.type'
    }
  }],
  aiModel: {
    type: String,
    default: 'gpt-4'
  },
  version: {
    type: String,
    default: '1.0'
  }
}, {
  timestamps: true
});

optimizationSchema.index({ user: 1, status: 1 });
optimizationSchema.index({ user: 1, type: 1 });
optimizationSchema.index({ user: 1, impact: 1 });
optimizationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('AIOptimization', optimizationSchema); 