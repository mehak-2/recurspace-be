const express = require('express');
const { body, param } = require('express-validator');
const {
  getIntegrations,
  connectIntegration,
  disconnectIntegration,
  syncIntegration,
  getIntegrationStatus
} = require('../controllers/integrationController');

const router = express.Router();

const validateIntegrationConnection = [
  body('credentials').optional().isObject().withMessage('Credentials must be an object'),
  body('settings').optional().isObject().withMessage('Settings must be an object')
];

const validateSyncRequest = [
  body('direction').optional().isIn(['bidirectional', 'import', 'export']).withMessage('Invalid sync direction')
];

const validateIntegrationParam = [
  param('integration').isIn(['googleCalendar', 'gmail', 'slack', 'github', 'notion', 'trello']).withMessage('Invalid integration type')
];

router.get('/', getIntegrations);
router.post('/:integration/connect', validateIntegrationParam, validateIntegrationConnection, connectIntegration);
router.delete('/:integration/disconnect', validateIntegrationParam, disconnectIntegration);
router.post('/:integration/sync', validateIntegrationParam, validateSyncRequest, syncIntegration);
router.get('/:integration/status', validateIntegrationParam, getIntegrationStatus);

module.exports = router; 