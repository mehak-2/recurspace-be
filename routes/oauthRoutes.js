const express = require('express');
const {
  googleAuth,
  githubAuth,
  googleCalendarAuth,
  githubIntegrationAuth,
  slackIntegrationAuth,
  getOAuthUrls
} = require('../controllers/oauthController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Authentication OAuth routes (no auth required)
router.get('/auth/google', googleAuth);
router.get('/auth/github', githubAuth);

// Integration OAuth routes (auth required)
router.get('/integrations/google-calendar', authMiddleware, googleCalendarAuth);
router.get('/integrations/github', authMiddleware, githubIntegrationAuth);
router.get('/integrations/slack', authMiddleware, slackIntegrationAuth);

// Get OAuth URLs for frontend
router.get('/urls', getOAuthUrls);

module.exports = router; 