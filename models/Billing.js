const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invoiceNumber: {
    type: String,
    unique: true
  },
  client: {
    name: {
      type: String,
      required: true
    },
    email: String,
    company: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  services: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    quantity: {
      type: Number,
      default: 1
    },
    rate: {
      type: Number,
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  }],
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'pending', 'overdue', 'cancelled'],
    default: 'draft'
  },
  dueDate: {
    type: Date,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  paidDate: Date,
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'paypal', 'check', 'cash'],
    default: 'credit_card'
  },
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['weekly', 'bi_weekly', 'monthly', 'quarterly', 'yearly'],
      default: 'monthly'
    },
    nextBillingDate: Date,
    endDate: Date
  },
  notes: String,
  terms: String,
  metadata: {
    tags: [String],
    category: String,
    project: String
  }
}, {
  timestamps: true
});

const recurringBillingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  client: {
    name: {
      type: String,
      required: true
    },
    email: String,
    company: String
  },
  services: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    quantity: {
      type: Number,
      default: 1
    },
    rate: {
      type: Number,
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  }],
  total: {
    type: Number,
    required: true
  },
  frequency: {
    type: String,
    enum: ['weekly', 'bi_weekly', 'monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled'],
    default: 'active'
  },
  startDate: {
    type: Date,
    required: true
  },
  nextBillingDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  autoGenerate: {
    type: Boolean,
    default: true
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'paypal'],
    default: 'credit_card'
  },
  metadata: {
    tags: [String],
    category: String
  }
}, {
  timestamps: true
});

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  method: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'paypal', 'check', 'cash'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: String,
  gateway: String,
  processedAt: Date,
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

invoiceSchema.pre('save', function(next) {
  if (this.isNew) {
    this.invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
const RecurringBilling = mongoose.model('RecurringBilling', recurringBillingSchema);
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = {
  Invoice,
  RecurringBilling,
  Payment
}; 