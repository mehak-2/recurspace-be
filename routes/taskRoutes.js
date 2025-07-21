const express = require('express');
const { body } = require('express-validator');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  completeTask,
  getTaskStats
} = require('../controllers/taskController');

const router = express.Router();

const validateTask = [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('status').optional().isIn(['pending', 'in-progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('isRecurring').optional().isBoolean().withMessage('isRecurring must be a boolean'),
  body('recurrencePattern').optional().isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid recurrence pattern')
];

const validateStatusUpdate = [
  body('status').isIn(['pending', 'in-progress', 'completed', 'cancelled']).withMessage('Invalid status')
];

router.post('/', validateTask, createTask);
router.get('/', getTasks);
router.get('/stats', getTaskStats);
router.get('/:id', getTaskById);
router.put('/:id', validateTask, updateTask);
router.patch('/:id/status', validateStatusUpdate, updateTaskStatus);
router.patch('/:id/complete', completeTask);
router.delete('/:id', deleteTask);

module.exports = router; 