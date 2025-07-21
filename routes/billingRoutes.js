const express = require('express');
const { body } = require('express-validator');
const {
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
} = require('../controllers/billingController');

const router = express.Router();

const validateInvoice = [
  body('client.name').isLength({ min: 1, max: 200 }).withMessage('Client name is required'),
  body('services').isArray({ min: 1 }).withMessage('At least one service is required'),
  body('services.*.name').isLength({ min: 1, max: 200 }).withMessage('Service name is required'),
  body('services.*.rate').isFloat({ min: 0 }).withMessage('Service rate must be a positive number'),
  body('services.*.quantity').isInt({ min: 1 }).withMessage('Service quantity must be at least 1'),
  body('total').isFloat({ min: 0 }).withMessage('Total must be a positive number'),
  body('dueDate').notEmpty().withMessage('Due date is required')
];

const validateRecurringBilling = [
  body('name').isLength({ min: 1, max: 200 }).withMessage('Name is required'),
  body('client.name').isLength({ min: 1, max: 200 }).withMessage('Client name is required'),
  body('services').isArray({ min: 1 }).withMessage('At least one service is required'),
  body('services.*.name').isLength({ min: 1, max: 200 }).withMessage('Service name is required'),
  body('services.*.rate').isFloat({ min: 0 }).withMessage('Service rate must be a positive number'),
  body('services.*.amount').isFloat({ min: 0 }).withMessage('Service amount must be a positive number'),
  body('total').isFloat({ min: 0 }).withMessage('Total must be a positive number'),
  body('frequency').isIn(['weekly', 'bi_weekly', 'monthly', 'quarterly', 'yearly']).withMessage('Invalid frequency'),
  body('startDate').isISO8601().withMessage('Start date must be a valid date'),
  body('nextBillingDate').isISO8601().withMessage('Next billing date must be a valid date')
];

router.get('/overview', getDashboardOverview);

router.get('/analytics', getBillingAnalytics);

router.get('/invoices', getInvoices);

router.get('/invoices/:id', getInvoiceById);

router.post('/invoices', validateInvoice, createInvoice);

router.put('/invoices/:id', validateInvoice, updateInvoice);

router.delete('/invoices/:id', deleteInvoice);

router.get('/recurring', getRecurringBilling);

router.post('/recurring', validateRecurringBilling, createRecurringBilling);

router.put('/recurring/:id', validateRecurringBilling, updateRecurringBilling);

router.delete('/recurring/:id', deleteRecurringBilling);

router.post('/recurring/:recurringBillingId/generate-invoice', generateInvoice);

module.exports = router; 