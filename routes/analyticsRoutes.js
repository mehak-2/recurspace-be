const express = require('express');
const { body } = require('express-validator');
const {
  generateAnalytics,
  getAnalytics,
  getAnalyticsSummary,
  getAnalyticsChart,
  getDashboardAnalytics,
  deleteAnalytics
} = require('../controllers/analyticsController');

const router = express.Router();

const validateAnalyticsGeneration = [
  body('type').optional().isIn(['task', 'workflow', 'template', 'performance', 'all']).withMessage('Invalid analytics type'),
  body('period').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).withMessage('Invalid period'),
  body('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date format')
];

router.post('/generate', validateAnalyticsGeneration, generateAnalytics);
router.get('/', getAnalytics);
router.get('/dashboard', getDashboardAnalytics);
router.get('/summary', getAnalyticsSummary);
router.get('/chart', getAnalyticsChart);
router.delete('/', deleteAnalytics);

module.exports = router; 