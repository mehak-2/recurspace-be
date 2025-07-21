const express = require('express');
const { body } = require('express-validator');
const {
  generateOptimizations,
  getOptimizations,
  getOptimizationById,
  updateOptimizationStatus,
  deleteOptimization,
  getOptimizationStats,
  getPatternAnalysis,
  createRuleFromPattern,
  getAvailableRules
} = require('../controllers/aiOptimizerController');

const router = express.Router();

const validateOptimizationGeneration = [
  body('type').isIn(['workflow', 'task', 'schedule', 'general']).withMessage('Invalid optimization type'),
  body('data').optional().isObject().withMessage('Data must be an object')
];

const validateStatusUpdate = [
  body('status').isIn(['pending', 'applied', 'rejected', 'in_progress']).withMessage('Invalid status')
];

const validateRuleCreation = [
  body('ruleName').optional().isString().withMessage('Rule name must be a string'),
  body('action').optional().isIn(['create_task', 'update_status', 'assign_user', 'send_notification']).withMessage('Invalid action'),
  body('conditions').optional().isObject().withMessage('Conditions must be an object')
];

router.post('/generate', validateOptimizationGeneration, generateOptimizations);
router.get('/', getOptimizations);
router.get('/stats', getOptimizationStats);
router.get('/patterns', getPatternAnalysis);
router.get('/rules', getAvailableRules);
router.post('/rules', validateRuleCreation, createRuleFromPattern);
router.get('/:id', getOptimizationById);
router.patch('/:id/status', validateStatusUpdate, updateOptimizationStatus);
router.delete('/:id', deleteOptimization);

module.exports = router;