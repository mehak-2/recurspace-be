const express = require('express');
const { body } = require('express-validator');
const {
  getUserProfile,
  updateUserProfile,
  getUserSettings,
  updateUserSettings,
  getBillingInfo,
  updatePaymentMethod,
  changePassword,
  enableTwoFactor,
  disableTwoFactor,
  getActiveSessions,
  revokeSession,
  revokeAllSessions,
  connectIntegration,
  disconnectIntegration,
  generateApiKey
} = require('../controllers/settingsController');

const router = express.Router();

const validateProfileUpdate = [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('company').optional().trim().isLength({ max: 100 }).withMessage('Company name cannot exceed 100 characters'),
  body('timezone').optional().isIn(['UTC-8', 'UTC-5', 'UTC+0', 'UTC+1']).withMessage('Invalid timezone'),
  body('workHours.start').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time format'),
  body('workHours.end').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time format'),
  body('workingDays').optional().isArray().withMessage('Working days must be an array')
];

const validatePasswordChange = [
  body('currentPassword').isLength({ min: 6 }).withMessage('Current password must be at least 6 characters'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

const validatePaymentMethod = [
  body('paymentMethod.cardNumber').isCreditCard().withMessage('Invalid card number'),
  body('paymentMethod.expiryMonth').isInt({ min: 1, max: 12 }).withMessage('Invalid expiry month'),
  body('paymentMethod.expiryYear').isInt({ min: new Date().getFullYear() }).withMessage('Invalid expiry year'),
  body('paymentMethod.cvv').isLength({ min: 3, max: 4 }).withMessage('Invalid CVV')
];

router.get('/profile', getUserProfile);
router.put('/profile', validateProfileUpdate, updateUserProfile);
router.get('/settings', getUserSettings);
router.put('/settings', updateUserSettings);
router.get('/billing', getBillingInfo);
router.put('/billing/payment-method', validatePaymentMethod, updatePaymentMethod);
router.put('/password', validatePasswordChange, changePassword);
router.post('/2fa/enable', enableTwoFactor);
router.post('/2fa/disable', disableTwoFactor);
router.get('/sessions', getActiveSessions);
router.delete('/sessions/:sessionId', revokeSession);
router.delete('/sessions', revokeAllSessions);
router.post('/integrations/:integration/connect', connectIntegration);
router.post('/integrations/:integration/disconnect', disconnectIntegration);
router.post('/api-key/generate', generateApiKey);

module.exports = router; 