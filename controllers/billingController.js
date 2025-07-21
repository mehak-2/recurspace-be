const { Invoice, RecurringBilling, Payment } = require('../models/Billing');
const Analytics = require('../models/Analytics');

const createInvoice = async (req, res) => {
  try {
    // Process services to ensure amounts are calculated
    const processedServices = req.body.services.map(service => ({
      ...service,
      amount: service.amount || (service.quantity * service.rate)
    }));

    // Calculate totals if not provided
    const subtotal = processedServices.reduce((sum, service) => sum + service.amount, 0);
    const total = subtotal + (req.body.tax || 0) - (req.body.discount || 0);

    const invoiceData = {
      ...req.body,
      services: processedServices,
      subtotal,
      total,
      dueDate: new Date(req.body.dueDate),
      user: req.user.id
    };

    console.log('Creating invoice with data:', invoiceData);

    const invoice = await Invoice.create(invoiceData);
    
    await Analytics.create({
      user: req.user.id,
      type: 'performance',
      metric: 'invoice_created',
      value: invoice.total,
      unit: 'currency',
      metadata: {
        category: 'billing',
        subcategory: 'invoice',
        context: {
          invoiceId: invoice._id,
          status: invoice.status
        }
      }
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Invoice number already exists' 
      });
    }
    
    res.status(500).json({ message: 'Failed to create invoice' });
  }
};

const getInvoices = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { user: req.user.id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'client.name': { $regex: search, $options: 'i' } },
        { 'client.company': { $regex: search, $options: 'i' } }
      ];
    }

    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Invoice.countDocuments(query);

    res.json({
      invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ message: 'Failed to fetch invoice' });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ message: 'Failed to update invoice' });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ message: 'Failed to delete invoice' });
  }
};

const createRecurringBilling = async (req, res) => {
  try {
    const billingData = {
      ...req.body,
      user: req.user.id
    };

    const recurringBilling = await RecurringBilling.create(billingData);
    
    await Analytics.create({
      user: req.user.id,
      type: 'performance',
      metric: 'recurring_billing_created',
      value: recurringBilling.total,
      unit: 'currency',
      metadata: {
        category: 'billing',
        subcategory: 'recurring',
        context: {
          billingId: recurringBilling._id,
          frequency: recurringBilling.frequency
        }
      }
    });

    res.status(201).json(recurringBilling);
  } catch (error) {
    console.error('Error creating recurring billing:', error);
    res.status(500).json({ message: 'Failed to create recurring billing' });
  }
};

const getRecurringBilling = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { user: req.user.id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const recurringBillings = await RecurringBilling.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await RecurringBilling.countDocuments(query);

    res.json({
      recurringBillings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching recurring billing:', error);
    res.status(500).json({ message: 'Failed to fetch recurring billing' });
  }
};

const updateRecurringBilling = async (req, res) => {
  try {
    const recurringBilling = await RecurringBilling.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!recurringBilling) {
      return res.status(404).json({ message: 'Recurring billing not found' });
    }

    res.json(recurringBilling);
  } catch (error) {
    console.error('Error updating recurring billing:', error);
    res.status(500).json({ message: 'Failed to update recurring billing' });
  }
};

const deleteRecurringBilling = async (req, res) => {
  try {
    const recurringBilling = await RecurringBilling.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!recurringBilling) {
      return res.status(404).json({ message: 'Recurring billing not found' });
    }

    res.json({ message: 'Recurring billing deleted successfully' });
  } catch (error) {
    console.error('Error deleting recurring billing:', error);
    res.status(500).json({ message: 'Failed to delete recurring billing' });
  }
};

const getBillingAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const userId = req.user.id;
    const now = new Date();
    
    let startDate;
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [
      totalRevenue,
      pendingAmount,
      overdueAmount,
      totalInvoices,
      paidInvoices,
      recurringRevenue,
      monthlyTrend,
      statusDistribution
    ] = await Promise.all([
      Invoice.aggregate([
        { $match: { user: userId, status: 'paid', paidDate: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Invoice.aggregate([
        { $match: { user: userId, status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Invoice.aggregate([
        { $match: { user: userId, status: 'overdue' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Invoice.countDocuments({ user: userId, createdAt: { $gte: startDate } }),
      Invoice.countDocuments({ user: userId, status: 'paid', paidDate: { $gte: startDate } }),
      RecurringBilling.aggregate([
        { $match: { user: userId, status: 'active' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Invoice.aggregate([
        { $match: { user: userId, status: 'paid', paidDate: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: '$paidDate' },
              month: { $month: '$paidDate' }
            },
            revenue: { $sum: '$total' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Invoice.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    const analytics = {
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingAmount: pendingAmount[0]?.total || 0,
      overdueAmount: overdueAmount[0]?.total || 0,
      totalInvoices,
      paidInvoices,
      collectionRate: totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0,
      recurringRevenue: recurringRevenue[0]?.total || 0,
      monthlyTrend,
      statusDistribution: statusDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      averageInvoiceValue: totalInvoices > 0 ? (totalRevenue[0]?.total || 0) / totalInvoices : 0
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching billing analytics:', error);
    res.status(500).json({ message: 'Failed to fetch billing analytics' });
  }
};

const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      recentInvoices,
      recentRecurringBilling,
      revenueStats,
      upcomingPayments
    ] = await Promise.all([
      Invoice.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5),
      RecurringBilling.find({ user: userId, status: 'active' })
        .sort({ nextBillingDate: 1 })
        .limit(5),
      Invoice.aggregate([
        { $match: { user: userId, status: 'paid', paidDate: { $gte: monthAgo } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Invoice.find({
        user: userId,
        status: { $in: ['pending', 'sent'] },
        dueDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) }
      }).sort({ dueDate: 1 })
    ]);

    const overview = {
      recentInvoices,
      recentRecurringBilling,
      totalRevenue: revenueStats[0]?.total || 0,
      upcomingPayments,
      totalUpcomingAmount: upcomingPayments.reduce((sum, inv) => sum + inv.total, 0)
    };

    res.json(overview);
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard overview' });
  }
};

const generateInvoice = async (req, res) => {
  try {
    const { recurringBillingId } = req.params;
    
    const recurringBilling = await RecurringBilling.findOne({
      _id: recurringBillingId,
      user: req.user.id
    });

    if (!recurringBilling) {
      return res.status(404).json({ message: 'Recurring billing not found' });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoiceData = {
      user: req.user.id,
      client: recurringBilling.client,
      services: recurringBilling.services,
      subtotal: recurringBilling.total,
      total: recurringBilling.total,
      dueDate,
      recurring: {
        isRecurring: true,
        frequency: recurringBilling.frequency,
        nextBillingDate: recurringBilling.nextBillingDate
      },
      metadata: {
        category: recurringBilling.metadata?.category,
        tags: recurringBilling.metadata?.tags
      }
    };

    const invoice = await Invoice.create(invoiceData);

    const nextBillingDate = new Date(recurringBilling.nextBillingDate);
    switch (recurringBilling.frequency) {
      case 'weekly':
        nextBillingDate.setDate(nextBillingDate.getDate() + 7);
        break;
      case 'bi_weekly':
        nextBillingDate.setDate(nextBillingDate.getDate() + 14);
        break;
      case 'monthly':
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
        break;
      case 'yearly':
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
        break;
    }

    await RecurringBilling.findByIdAndUpdate(recurringBillingId, {
      nextBillingDate
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ message: 'Failed to generate invoice' });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  createRecurringBilling,
  getRecurringBilling,
  updateRecurringBilling,
  deleteRecurringBilling,
  getBillingAnalytics,
  getDashboardOverview,
  generateInvoice
}; 