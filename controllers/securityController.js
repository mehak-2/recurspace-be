const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const jwt = require('jsonwebtoken');

const getSecuritySettings = async (req, res) => {
  try {
    const settings = await UserSettings.findOne({ user: req.user.id });
    
    if (!settings) {
      return res.json({
        success: true,
        security: {
          twoFactorAuth: {
            enabled: false,
            method: 'authenticator',
            backupCodes: []
          },
          sessionTimeout: 24,
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: false
          },
          loginHistory: [],
          activeSessions: []
        }
      });
    }

    const security = {
      twoFactorAuth: {
        enabled: settings.security?.twoFactorAuth?.enabled || false,
        method: settings.security?.twoFactorAuth?.method || 'authenticator',
        backupCodes: settings.security?.twoFactorAuth?.backupCodes || []
      },
      sessionTimeout: settings.security?.sessionTimeout || 24,
      passwordPolicy: {
        minLength: settings.security?.passwordPolicy?.minLength || 8,
        requireUppercase: settings.security?.passwordPolicy?.requireUppercase || true,
        requireLowercase: settings.security?.passwordPolicy?.requireLowercase || true,
        requireNumbers: settings.security?.passwordPolicy?.requireNumbers || true,
        requireSpecialChars: settings.security?.passwordPolicy?.requireSpecialChars || false
      },
      loginHistory: settings.security?.loginHistory || [],
      activeSessions: settings.security?.activeSessions || []
    };

    res.json({
      success: true,
      security
    });
  } catch (error) {
    console.error('Error fetching security settings:', error);
    res.status(500).json({ message: 'Error fetching security settings' });
  }
};

const updateSecuritySettings = async (req, res) => {
  try {
    const { twoFactorAuth, sessionTimeout, passwordPolicy } = req.body;

    const updateData = {};

    if (twoFactorAuth !== undefined) {
      updateData['security.twoFactorAuth.enabled'] = twoFactorAuth.enabled;
      if (twoFactorAuth.method) {
        updateData['security.twoFactorAuth.method'] = twoFactorAuth.method;
      }
    }

    if (sessionTimeout !== undefined) {
      updateData['security.sessionTimeout'] = sessionTimeout;
    }

    if (passwordPolicy !== undefined) {
      Object.keys(passwordPolicy).forEach(key => {
        updateData[`security.passwordPolicy.${key}`] = passwordPolicy[key];
      });
    }

    const settings = await UserSettings.findOneAndUpdate(
      { user: req.user.id },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Security settings updated successfully',
      security: settings.security
    });
  } catch (error) {
    console.error('Error updating security settings:', error);
    res.status(500).json({ message: 'Error updating security settings' });
  }
};

const enableTwoFactorAuth = async (req, res) => {
  try {
    const { method = 'authenticator' } = req.body;

    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substr(2, 8).toUpperCase()
    );

    const settings = await UserSettings.findOneAndUpdate(
      { user: req.user.id },
      {
        $set: {
          'security.twoFactorAuth.enabled': true,
          'security.twoFactorAuth.method': method,
          'security.twoFactorAuth.backupCodes': backupCodes
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Two-factor authentication enabled successfully',
      backupCodes,
      qrCode: `otpauth://totp/RecurSpace:${req.user.email}?secret=JBSWY3DPEHPK3PXP&issuer=RecurSpace`
    });
  } catch (error) {
    console.error('Error enabling two-factor authentication:', error);
    res.status(500).json({ message: 'Error enabling two-factor authentication' });
  }
};

const disableTwoFactorAuth = async (req, res) => {
  try {
    const settings = await UserSettings.findOneAndUpdate(
      { user: req.user.id },
      {
        $set: {
          'security.twoFactorAuth.enabled': false,
          'security.twoFactorAuth.backupCodes': []
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Two-factor authentication disabled successfully'
    });
  } catch (error) {
    console.error('Error disabling two-factor authentication:', error);
    res.status(500).json({ message: 'Error disabling two-factor authentication' });
  }
};

const getActiveSessions = async (req, res) => {
  try {
    const settings = await UserSettings.findOne({ user: req.user.id });
    
    const sessions = settings?.security?.activeSessions || [
      {
        id: 'current',
        device: 'Chrome on macOS',
        location: '192.168.1.1',
        lastActive: new Date(),
        status: 'active',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    ];

    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    res.status(500).json({ message: 'Error fetching active sessions' });
  }
};

const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const settings = await UserSettings.findOne({ user: req.user.id });
    
    if (settings?.security?.activeSessions) {
      const updatedSessions = settings.security.activeSessions.filter(
        session => session.id !== sessionId
      );

      await UserSettings.findOneAndUpdate(
        { user: req.user.id },
        { $set: { 'security.activeSessions': updatedSessions } }
      );
    }

    res.json({
      success: true,
      message: 'Session revoked successfully'
    });
  } catch (error) {
    console.error('Error revoking session:', error);
    res.status(500).json({ message: 'Error revoking session' });
  }
};

const revokeAllSessions = async (req, res) => {
  try {
    await UserSettings.findOneAndUpdate(
      { user: req.user.id },
      { $set: { 'security.activeSessions': [] } }
    );

    res.json({
      success: true,
      message: 'All sessions revoked successfully'
    });
  } catch (error) {
    console.error('Error revoking all sessions:', error);
    res.status(500).json({ message: 'Error revoking all sessions' });
  }
};

const getLoginHistory = async (req, res) => {
  try {
    const settings = await UserSettings.findOne({ user: req.user.id });
    
    const loginHistory = settings?.security?.loginHistory || [
      {
        id: '1',
        timestamp: new Date(),
        device: 'Chrome on macOS',
        location: '192.168.1.1',
        status: 'success',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    ];

    res.json({
      success: true,
      loginHistory
    });
  } catch (error) {
    console.error('Error fetching login history:', error);
    res.status(500).json({ message: 'Error fetching login history' });
  }
};

const generateApiKey = async (req, res) => {
  try {
    const apiKey = `rcs_sk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { apiKey },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      apiKey: user.apiKey
    });
  } catch (error) {
    console.error('Error generating API key:', error);
    res.status(500).json({ message: 'Error generating API key' });
  }
};

const revokeApiKey = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user.id,
      { apiKey: null }
    );

    res.json({
      success: true,
      message: 'API key revoked successfully'
    });
  } catch (error) {
    console.error('Error revoking API key:', error);
    res.status(500).json({ message: 'Error revoking API key' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
};

module.exports = {
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
}; 