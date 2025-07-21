const express = require('express');
const { body, param } = require('express-validator');
const {
  getSecuritySettings,
  updateSecuritySettings,
  enableTwoFactorAuth,
  disableTwoFactorAuth,
  getActiveSessions,
  revokeSession,
  revokeAllSessions,
  getLoginHistory,
  generateApiKey,
  revokeApiKey,
  changePassword
} = require('../controllers/securityController');

const router = express.Router();

const validateSecuritySettings = [
  body('twoFactorAuth.enabled').optional().isBoolean().withMessage('Two-factor auth enabled must be boolean'),
  body('twoFactorAuth.method').optional().isIn(['authenticator', 'sms', 'email']).withMessage('Invalid 2FA method'),
  body('sessionTimeout').optional().isInt({ min: 1, max: 168 }).withMessage('Session timeout must be between 1 and 168 hours'),
  body('passwordPolicy.minLength').optional().isInt({ min: 6, max: 50 }).withMessage('Password min length must be between 6 and 50'),
  body('passwordPolicy.requireUppercase').optional().isBoolean().withMessage('Require uppercase must be boolean'),
  body('passwordPolicy.requireLowercase').optional().isBoolean().withMessage('Require lowercase must be boolean'),
  body('passwordPolicy.requireNumbers').optional().isBoolean().withMessage('Require numbers must be boolean'),
  body('passwordPolicy.requireSpecialChars').optional().isBoolean().withMessage('Require special chars must be boolean')
];

const validateTwoFactorAuth = [
  body('method').optional().isIn(['authenticator', 'sms', 'email']).withMessage('Invalid 2FA method')
];

const validatePasswordChange = [
  body('currentPassword').isString().isLength({ min: 1 }).withMessage('Current password is required'),
  body('newPassword').isString().isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

const validateSessionParam = [
  param('sessionId').isString().isLength({ min: 1 }).withMessage('Session ID is required')
];

router.get('/settings', getSecuritySettings);
router.put('/settings', validateSecuritySettings, updateSecuritySettings);
router.post('/2fa/enable', validateTwoFactorAuth, enableTwoFactorAuth);
router.post('/2fa/disable', disableTwoFactorAuth);
router.get('/sessions', getActiveSessions);
router.delete('/sessions/:sessionId', validateSessionParam, revokeSession);
router.delete('/sessions', revokeAllSessions);
router.get('/login-history', getLoginHistory);
router.post('/api-key/generate', generateApiKey);
router.delete('/api-key', revokeApiKey);
router.post('/change-password', validatePasswordChange, changePassword);

module.exports = router; 