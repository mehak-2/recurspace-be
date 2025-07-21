const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  type: {
    type: String,
    enum: ['task', 'workflow', 'email', 'document', 'report', 'automation'],
    required: true
  },
  category: {
    type: String,
    enum: ['business', 'personal', 'project', 'communication', 'reporting', 'automation'],
    default: 'business'
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  variables: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['string', 'number', 'date', 'boolean', 'array', 'object'],
      default: 'string'
    },
    defaultValue: mongoose.Schema.Types.Mixed,
    required: {
      type: Boolean,
      default: false
    },
    description: String,
    validation: {
      min: Number,
      max: Number,
      pattern: String,
      options: [String]
    }
  }],
  metadata: {
    estimatedTime: Number,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    tags: [{
      type: String,
      trim: true
    }],
    version: {
      type: String,
      default: '1.0'
    }
  },
  automation: {
    enabled: {
      type: Boolean,
      default: false
    },
    triggers: [{
      type: String,
      enum: ['schedule', 'event', 'condition', 'manual']
    }],
    conditions: [{
      field: String,
      operator: String,
      value: mongoose.Schema.Types.Mixed
    }],
    actions: [{
      type: String,
      enum: ['create_task', 'create_workflow', 'send_email', 'generate_report']
    }],
    schedule: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly']
      },
      dayOfWeek: Number,
      dayOfMonth: Number,
      time: String
    }
  },
  usage: {
    totalUses: {
      type: Number,
      default: 0
    },
    lastUsed: Date,
    successRate: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    averageTime: Number
  },
  permissions: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowDuplication: {
      type: Boolean,
      default: true
    },
    allowModification: {
      type: Boolean,
      default: true
    }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'archived', 'deprecated'],
    default: 'draft'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'admin'],
      default: 'viewer'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  parentTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    default: null
  }
}, {
  timestamps: true
});

templateSchema.index({ user: 1, type: 1 });
templateSchema.index({ user: 1, category: 1 });
templateSchema.index({ user: 1, status: 1 });
templateSchema.index({ 'permissions.isPublic': 1, type: 1 });

templateSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.metadata.version = this.metadata.version || '1.0';
  }
  next();
});

module.exports = mongoose.model('Template', templateSchema); 