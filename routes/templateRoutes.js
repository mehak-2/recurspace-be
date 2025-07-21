const express = require('express');
const { body } = require('express-validator');
const {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  executeTemplate,
  getPublicTemplates,
  getTemplateStats,
  searchTemplates,
  duplicateTemplate,
  copyTemplate
} = require('../controllers/templateController');

const router = express.Router();

const validateTemplate = [
  body('name').isLength({ min: 1, max: 200 }).withMessage('Name must be between 1 and 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('type').isIn(['task', 'workflow', 'email', 'document', 'report', 'automation']).withMessage('Invalid template type'),
  body('category').optional().isIn(['business', 'personal', 'project', 'communication', 'reporting', 'automation']).withMessage('Invalid category'),
  body('content').isLength({ min: 1 }).withMessage('Content is required'),
  body('variables').optional().isArray().withMessage('Variables must be an array'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object'),
  body('automation').optional().isObject().withMessage('Automation must be an object'),
  body('permissions').optional().isObject().withMessage('Permissions must be an object')
];

const validateTemplateUpdate = [
  body('name').optional().isLength({ min: 1, max: 200 }).withMessage('Name must be between 1 and 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('type').optional().isIn(['task', 'workflow', 'email', 'document', 'report', 'automation']).withMessage('Invalid template type'),
  body('category').optional().isIn(['business', 'personal', 'project', 'communication', 'reporting', 'automation']).withMessage('Invalid category'),
  body('content').optional().isLength({ min: 1 }).withMessage('Content cannot be empty'),
  body('variables').optional().isArray().withMessage('Variables must be an array'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object'),
  body('automation').optional().isObject().withMessage('Automation must be an object'),
  body('permissions').optional().isObject().withMessage('Permissions must be an object')
];

const validateTemplateExecution = [
  body('variables').isObject().withMessage('Variables must be an object'),
  body('targetType').optional().isString().withMessage('Target type must be a string')
];

router.get('/', getTemplates);
router.get('/public', getPublicTemplates);
router.get('/stats', getTemplateStats);
router.get('/search', searchTemplates);
router.get('/:id', getTemplateById);
router.post('/', validateTemplate, createTemplate);
router.put('/:id', validateTemplateUpdate, updateTemplate);
router.delete('/:id', deleteTemplate);
router.post('/:id/execute', validateTemplateExecution, executeTemplate);
router.post('/:id/duplicate', duplicateTemplate);
router.post('/:id/copy', copyTemplate);

module.exports = router; 