const express = require('express');
const { body } = require('express-validator');
const {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  updateNotificationPreferences
} = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation middleware
const validateNotification = [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required and must be less than 100 characters'),
  body('message').trim().isLength({ min: 1, max: 500 }).withMessage('Message is required and must be less than 500 characters'),
  body('type').optional().isIn(['info', 'success', 'warning', 'error', 'task', 'workflow', 'billing', 'system']).withMessage('Invalid notification type'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority level'),
  body('actionUrl').optional().isURL().withMessage('Invalid action URL'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object')
];

const validatePreferences = [
  body('email').optional().isBoolean().withMessage('Email preference must be a boolean'),
  body('push').optional().isBoolean().withMessage('Push preference must be a boolean'),
  body('weekly').optional().isBoolean().withMessage('Weekly preference must be a boolean'),
  body('billing').optional().isBoolean().withMessage('Billing preference must be a boolean')
];

// Routes
router.get('/', authMiddleware, getNotifications);
router.get('/unread-count', authMiddleware, getUnreadCount);
router.post('/', authMiddleware, validateNotification, createNotification);
router.put('/:id/read', authMiddleware, markAsRead);
router.put('/mark-all-read', authMiddleware, markAllAsRead);
router.delete('/:id', authMiddleware, deleteNotification);
router.delete('/', authMiddleware, deleteAllNotifications);
router.put('/preferences', authMiddleware, validatePreferences, updateNotificationPreferences);

module.exports = router; 