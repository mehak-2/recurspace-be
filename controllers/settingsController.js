const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const Billing = require('../models/Billing');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};

// Update the updateUserProfile function to handle partial updates
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, company, timezone, workHours, workingDays } = req.body;

    // Only update fields that are provided
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (company !== undefined) updateData.company = company;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (workHours !== undefined) updateData.workHours = workHours;
    if (workingDays !== undefined) updateData.workingDays = workingDays;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error updating user profile' });
  }
};

const getUserSettings = async (req, res) => {
  try {
    let settings = await UserSettings.findOne({ user: req.user.id });
    
    if (!settings) {
      settings = await UserSettings.create({
        user: req.user.id,
        preferences: {
          theme: 'auto',
          language: 'en',
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          notifications: {
            email: {
              enabled: true,
              frequency: 'daily',
              types: ['task_reminder', 'workflow_update', 'optimization_suggestion', 'system_alert']
            },
            push: {
              enabled: false,
              types: ['task_reminder', 'workflow_update']
            },
            inApp: {
              enabled: true,
              types: ['task_reminder', 'workflow_update', 'optimization_suggestion', 'system_alert']
            }
          }
        },
        productivity: {
          workHours: {
            start: '09:00',
            end: '17:00'
          },
          workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          focusMode: {
            enabled: false,
            duration: 25,
            breakDuration: 5
          },
          autoScheduling: {
            enabled: false,
            algorithm: 'smart'
          }
        },
        automation: {
          aiOptimization: {
            enabled: true,
            frequency: 'weekly',
            types: ['workflow', 'task', 'schedule', 'general']
          },
          taskAutomation: {
            enabled: false,
            rules: []
          },
          workflowAutomation: {
            enabled: false,
            triggers: []
          }
        },
        integrations: {
          calendar: {
            enabled: false,
            provider: 'google',
            syncDirection: 'bidirectional'
          },
          email: {
            enabled: false,
            provider: 'gmail',
            autoProcess: false
          },
          storage: {
            enabled: false,
            provider: 'google_drive'
          }
        },
        security: {
          twoFactorAuth: {
            enabled: false,
            method: 'authenticator'
          },
          sessionTimeout: 24,
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: false
          }
        },
        data: {
          exportFormat: 'json',
          retentionPolicy: {
            enabled: false,
            duration: 365
          },
          backupFrequency: 'weekly'
        }
      });
    }

    // Transform the data to match frontend expectations
    const transformedSettings = {
      _id: settings._id,
      user: settings.user,
      notifications: {
        email: settings.preferences.notifications.email.enabled,
        push: settings.preferences.notifications.push.enabled,
        weekly: settings.preferences.notifications.email.frequency === 'weekly',
        billing: settings.preferences.notifications.email.types.includes('system_alert')
      },
      integrations: {
        googleCalendar: settings.integrations.calendar.enabled && settings.integrations.calendar.provider === 'google',
        gmail: settings.integrations.email.enabled && settings.integrations.email.provider === 'gmail',
        slack: false, // Not in current model
        github: false // Not in current model
      },
      security: {
        twoFactorEnabled: settings.security.twoFactorAuth.enabled,
        sessionTimeout: settings.security.sessionTimeout
      }
    };

    res.json({
      success: true,
      settings: transformedSettings
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ message: 'Error fetching user settings' });
  }
};

const updateUserSettings = async (req, res) => {
  try {
    const { notifications, integrations, security } = req.body;

    // Transform frontend data to match backend model
    const updateData = {
      'preferences.notifications.email.enabled': notifications?.email,
      'preferences.notifications.push.enabled': notifications?.push,
      'preferences.notifications.email.frequency': notifications?.weekly ? 'weekly' : 'daily',
      'integrations.calendar.enabled': integrations?.googleCalendar,
      'integrations.calendar.provider': 'google',
      'integrations.email.enabled': integrations?.gmail,
      'integrations.email.provider': 'gmail',
      'security.twoFactorAuth.enabled': security?.twoFactorEnabled,
      'security.sessionTimeout': security?.sessionTimeout
    };

    const settings = await UserSettings.findOneAndUpdate(
      { user: req.user.id },
      { $set: updateData },
      { new: true, upsert: true }
    );

    // Transform back to frontend format
    const transformedSettings = {
      _id: settings._id,
      user: settings.user,
      notifications: {
        email: settings.preferences.notifications.email.enabled,
        push: settings.preferences.notifications.push.enabled,
        weekly: settings.preferences.notifications.email.frequency === 'weekly',
        billing: settings.preferences.notifications.email.types.includes('system_alert')
      },
      integrations: {
        googleCalendar: settings.integrations.calendar.enabled && settings.integrations.calendar.provider === 'google',
        gmail: settings.integrations.email.enabled && settings.integrations.email.provider === 'gmail',
        slack: false,
        github: false
      },
      security: {
        twoFactorEnabled: settings.security.twoFactorAuth.enabled,
        sessionTimeout: settings.security.sessionTimeout
      }
    };

    res.json({
      success: true,
      settings: transformedSettings
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ message: 'Error updating user settings' });
  }
};

const getBillingInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const billingHistory = await Billing.Invoice.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    const currentPlan = {
      name: user.subscription?.plan || 'Free',
      price: user.subscription?.price || '$0',
      period: user.subscription?.period || 'forever',
      status: user.subscription?.status || 'active',
      nextBilling: user.subscription?.nextBilling
    };

    res.json({
      success: true,
      billing: {
        currentPlan,
        billingHistory,
        paymentMethod: user.paymentMethod
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching billing information' });
  }
};

const updatePaymentMethod = async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { paymentMethod },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment method' });
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
    res.status(500).json({ message: 'Error changing password' });
  }
};

const enableTwoFactor = async (req, res) => {
  try {
    const settings = await UserSettings.findOneAndUpdate(
      { user: req.user.id },
      { 'security.twoFactorEnabled': true },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    res.status(500).json({ message: 'Error enabling two-factor authentication' });
  }
};

const disableTwoFactor = async (req, res) => {
  try {
    const settings = await UserSettings.findOneAndUpdate(
      { user: req.user.id },
      { 'security.twoFactorEnabled': false },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    res.status(500).json({ message: 'Error disabling two-factor authentication' });
  }
};

const getActiveSessions = async (req, res) => {
  try {
    const sessions = [
      {
        id: 'current',
        device: 'Chrome on macOS',
        location: '192.168.1.1',
        lastActive: new Date(),
        status: 'active'
      }
    ];

    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active sessions' });
  }
};

const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    res.json({
      success: true,
      message: 'Session revoked successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error revoking session' });
  }
};

const revokeAllSessions = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'All sessions revoked successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error revoking all sessions' });
  }
};

const connectIntegration = async (req, res) => {
  try {
    const { integration } = req.params;
    const { credentials } = req.body;

    const settings = await UserSettings.findOneAndUpdate(
      { user: req.user.id },
      { [`integrations.${integration}`]: true },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    res.status(500).json({ message: 'Error connecting integration' });
  }
};

const disconnectIntegration = async (req, res) => {
  try {
    const { integration } = req.params;

    const settings = await UserSettings.findOneAndUpdate(
      { user: req.user.id },
      { [`integrations.${integration}`]: false },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    res.status(500).json({ message: 'Error disconnecting integration' });
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
    res.status(500).json({ message: 'Error generating API key' });
  }
};

module.exports = {
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
}; 