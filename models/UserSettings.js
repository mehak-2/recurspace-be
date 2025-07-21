const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY'
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '12h'
    },
    notifications: {
      email: {
        enabled: {
          type: Boolean,
          default: true
        },
        frequency: {
          type: String,
          enum: ['immediate', 'daily', 'weekly'],
          default: 'daily'
        },
        types: [{
          type: String,
          enum: ['task_reminder', 'workflow_update', 'optimization_suggestion', 'system_alert']
        }]
      },
      push: {
        enabled: {
          type: Boolean,
          default: true
        },
        types: [{
          type: String,
          enum: ['task_reminder', 'workflow_update', 'optimization_suggestion', 'system_alert']
        }]
      },
      inApp: {
        enabled: {
          type: Boolean,
          default: true
        },
        types: [{
          type: String,
          enum: ['task_reminder', 'workflow_update', 'optimization_suggestion', 'system_alert']
        }]
      }
    }
  },
  productivity: {
    workHours: {
      start: {
        type: String,
        default: '09:00'
      },
      end: {
        type: String,
        default: '17:00'
      }
    },
    workDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    }],
    focusMode: {
      enabled: {
        type: Boolean,
        default: false
      },
      duration: {
        type: Number,
        default: 25,
        min: 5,
        max: 120
      },
      breakDuration: {
        type: Number,
        default: 5,
        min: 1,
        max: 30
      }
    },
    autoScheduling: {
      enabled: {
        type: Boolean,
        default: false
      },
      algorithm: {
        type: String,
        enum: ['priority', 'deadline', 'duration', 'smart'],
        default: 'smart'
      }
    }
  },
  automation: {
    aiOptimization: {
      enabled: {
        type: Boolean,
        default: true
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly'
      },
      types: [{
        type: String,
        enum: ['workflow', 'task', 'schedule', 'general']
      }]
    },
    taskAutomation: {
      enabled: {
        type: Boolean,
        default: false
      },
      rules: [{
        name: String,
        condition: {
          field: String,
          operator: String,
          value: mongoose.Schema.Types.Mixed
        },
        action: {
          type: String,
          enum: ['create_task', 'update_status', 'assign_user', 'send_notification']
        },
        enabled: {
          type: Boolean,
          default: true
        }
      }]
    },
    workflowAutomation: {
      enabled: {
        type: Boolean,
        default: false
      },
      triggers: [{
        name: String,
        type: {
          type: String,
          enum: ['schedule', 'event', 'condition']
        },
        config: mongoose.Schema.Types.Mixed,
        enabled: {
          type: Boolean,
          default: true
        }
      }]
    }
  },
  integrations: {
    calendar: {
      enabled: {
        type: Boolean,
        default: false
      },
      provider: {
        type: String,
        enum: ['google', 'outlook', 'apple'],
        default: 'google'
      },
      syncDirection: {
        type: String,
        enum: ['import', 'export', 'bidirectional'],
        default: 'bidirectional'
      }
    },
    email: {
      enabled: {
        type: Boolean,
        default: false
      },
      provider: {
        type: String,
        enum: ['gmail', 'outlook', 'yahoo'],
        default: 'gmail'
      },
      autoProcess: {
        type: Boolean,
        default: false
      }
    },
    storage: {
      enabled: {
        type: Boolean,
        default: false
      },
      provider: {
        type: String,
        enum: ['google_drive', 'dropbox', 'onedrive'],
        default: 'google_drive'
      }
    }
  },
  security: {
    twoFactorAuth: {
      enabled: {
        type: Boolean,
        default: false
      },
      method: {
        type: String,
        enum: ['sms', 'email', 'authenticator'],
        default: 'authenticator'
      }
    },
    sessionTimeout: {
      type: Number,
      default: 24,
      min: 1,
      max: 168
    },
    passwordPolicy: {
      minLength: {
        type: Number,
        default: 8,
        min: 6,
        max: 50
      },
      requireUppercase: {
        type: Boolean,
        default: true
      },
      requireLowercase: {
        type: Boolean,
        default: true
      },
      requireNumbers: {
        type: Boolean,
        default: true
      },
      requireSpecialChars: {
        type: Boolean,
        default: false
      }
    }
  },
  data: {
    exportFormat: {
      type: String,
      enum: ['json', 'csv', 'pdf'],
      default: 'json'
    },
    retentionPolicy: {
      enabled: {
        type: Boolean,
        default: false
      },
      duration: {
        type: Number,
        default: 365,
        min: 30,
        max: 3650
      }
    },
    backupFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    }
  }
}, {
  timestamps: true
});

userSettingsSchema.index({ user: 1 });

module.exports = mongoose.model('UserSettings', userSettingsSchema); 