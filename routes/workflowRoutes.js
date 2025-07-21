const express = require('express');
const { body } = require('express-validator');
const {
  createWorkflow,
  getWorkflows,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow,
  updateWorkflowStep,
  getWorkflowStats,
  duplicateWorkflow,
  getWorkflowTrackerStats
} = require('../controllers/workflowController');

const router = express.Router();

const validateWorkflow = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('status').optional().isIn(['active', 'paused', 'completed', 'archived']).withMessage('Invalid status'),
  body('type').optional().isIn(['manual', 'automated', 'scheduled', 'triggered']).withMessage('Invalid type'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('steps').optional().isArray().withMessage('Steps must be an array'),
  body('steps.*.name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Step name must be between 1 and 100 characters'),
  body('steps.*.status').optional().isIn(['pending', 'in-progress', 'completed', 'failed', 'skipped']).withMessage('Invalid step status'),
  body('steps.*.order').optional().isInt({ min: 0 }).withMessage('Step order must be a positive integer'),
  body('automation.enabled').optional().isBoolean().withMessage('Automation enabled must be a boolean'),
  body('automation.triggers').optional().isArray().withMessage('Triggers must be an array'),
  body('automation.actions').optional().isArray().withMessage('Actions must be an array')
];

const validateStepUpdate = [
  body('stepIndex').isInt({ min: 0 }).withMessage('Step index must be a positive integer'),
  body('status').isIn(['pending', 'in-progress', 'completed', 'failed', 'skipped']).withMessage('Invalid status'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  body('actualTime').optional().isFloat({ min: 0 }).withMessage('Actual time must be a positive number')
];

router.post('/', validateWorkflow, createWorkflow);
router.get('/', getWorkflows);
router.get('/stats', getWorkflowStats);
router.get('/tracker-stats', getWorkflowTrackerStats);
router.get('/:id', getWorkflowById);
router.put('/:id', validateWorkflow, updateWorkflow);
router.patch('/:id/step', validateStepUpdate, updateWorkflowStep);
router.post('/:id/duplicate', duplicateWorkflow);
router.delete('/:id', deleteWorkflow);

module.exports = router; 