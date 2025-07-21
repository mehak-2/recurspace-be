const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workflow name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'archived', 'optimizing', 'needs_attention'],
    default: 'active'
  },
  type: {
    type: String,
    enum: ['manual', 'automated', 'scheduled', 'triggered'],
    default: 'manual'
  },
  frequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'Yearly'],
    default: 'Weekly'
  },
  nextDue: {
    type: Date,
    default: function() {
      const now = new Date();
      switch (this.frequency) {
        case 'Daily':
          return new Date(now.getTime() + 24 * 60 * 60 * 1000);
        case 'Weekly':
          return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        case 'Bi-weekly':
          return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        case 'Monthly':
          return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        case 'Quarterly':
          return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        case 'Yearly':
          return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        default:
          return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      }
    }
  },
  timeSaved: {
    type: String,
    default: '0h'
  },
  clients: [{
    type: String,
    trim: true
  }],
  completionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  steps: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'failed', 'skipped'],
      default: 'pending'
    },
    order: {
      type: Number,
      required: true
    },
    estimatedTime: Number,
    actualTime: Number,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dependencies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkflowStep'
    }],
    completedAt: Date,
    notes: String
  }],
  currentStep: {
    type: Number,
    default: 0
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: Date,
  startDate: {
    type: Date,
    default: Date.now
  },
  completedDate: Date,
  tags: [{
    type: String,
    trim: true
  }],
  automation: {
    enabled: {
      type: Boolean,
      default: false
    },
    triggers: [{
      type: String,
      enum: ['time', 'event', 'condition', 'manual']
    }],
    conditions: [{
      field: String,
      operator: String,
      value: mongoose.Schema.Types.Mixed
    }],
    actions: [{
      type: String,
      enum: ['create_task', 'send_notification', 'update_status', 'assign_user']
    }]
  },
  metrics: {
    totalSteps: {
      type: Number,
      default: 0
    },
    completedSteps: {
      type: Number,
      default: 0
    },
    averageStepTime: Number,
    totalTime: Number,
    efficiency: Number
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
  }]
}, {
  timestamps: true
});

workflowSchema.index({ user: 1, status: 1 });
workflowSchema.index({ user: 1, dueDate: 1 });
workflowSchema.index({ user: 1, priority: 1 });
workflowSchema.index({ user: 1, nextDue: 1 });

workflowSchema.pre('save', function(next) {
  if (this.steps && this.steps.length > 0) {
    this.metrics.totalSteps = this.steps.length;
    this.metrics.completedSteps = this.steps.filter(step => step.status === 'completed').length;
    this.progress = this.metrics.totalSteps > 0 ? 
      (this.metrics.completedSteps / this.metrics.totalSteps) * 100 : 0;
    this.completionRate = this.progress;
    
    if (this.progress === 100 && this.status !== 'completed') {
      this.status = 'completed';
      this.completedDate = new Date();
    }
  }
  next();
});

module.exports = mongoose.model('Workflow', workflowSchema); 