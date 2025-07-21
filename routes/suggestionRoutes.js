const express = require('express');
const { body } = require('express-validator');
const { getSuggestions } = require('../controllers/suggestionController');

const router = express.Router();

const validateTasks = [
  body('tasks').isArray({ min: 1 }).withMessage('Tasks must be a non-empty array'),
  body('tasks.*.title').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Task title must be between 1 and 100 characters'),
  body('tasks.*.frequency').isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Frequency must be daily, weekly, monthly, or yearly'),
  body('tasks.*.dueDate').isISO8601().withMessage('Due date must be a valid ISO date'),
  body('tasks.*.completed').isBoolean().withMessage('Completed must be a boolean value')
];

router.post('/', validateTasks, getSuggestions);

module.exports = router; 