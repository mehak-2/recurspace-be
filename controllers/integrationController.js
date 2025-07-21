const User = require('../models/User');
const UserSettings = require('../models/UserSettings');

const getIntegrations = async (req, res) => {
  try {
    const settings = await UserSettings.findOne({ user: req.user.id });
    
    if (!settings) {
      return res.json({
        success: true,
        integrations: {
          googleCalendar: { enabled: false, connected: false, lastSync: null },
          gmail: { enabled: false, connected: false, lastSync: null },
          slack: { enabled: false, connected: false, lastSync: null },
          github: { enabled: false, connected: false, lastSync: null },
          notion: { enabled: false, connected: false, lastSync: null },
          trello: { enabled: false, connected: false, lastSync: null }
        }
      });
    }

    const integrations = {
      googleCalendar: {
        enabled: settings.integrations?.calendar?.enabled || false,
        connected: settings.integrations?.calendar?.enabled || false,
        lastSync: settings.integrations?.calendar?.lastSync || null,
        provider: settings.integrations?.calendar?.provider || 'google',
        syncDirection: settings.integrations?.calendar?.syncDirection || 'bidirectional'
      },
      gmail: {
        enabled: settings.integrations?.email?.enabled || false,
        connected: settings.integrations?.email?.enabled || false,
        lastSync: settings.integrations?.email?.lastSync || null,
        provider: settings.integrations?.email?.provider || 'gmail',
        autoProcess: settings.integrations?.email?.autoProcess || false
      },
      slack: {
        enabled: settings.integrations?.slack?.enabled || false,
        connected: settings.integrations?.slack?.enabled || false,
        lastSync: settings.integrations?.slack?.lastSync || null,
        workspace: settings.integrations?.slack?.workspace || null
      },
      github: {
        enabled: settings.integrations?.github?.enabled || false,
        connected: settings.integrations?.github?.enabled || false,
        lastSync: settings.integrations?.github?.lastSync || null,
        username: settings.integrations?.github?.username || null
      },
      notion: {
        enabled: settings.integrations?.notion?.enabled || false,
        connected: settings.integrations?.notion?.enabled || false,
        lastSync: settings.integrations?.notion?.lastSync || null,
        workspace: settings.integrations?.notion?.workspace || null
      },
      trello: {
        enabled: settings.integrations?.trello?.enabled || false,
        connected: settings.integrations?.trello?.enabled || false,
        lastSync: settings.integrations?.trello?.lastSync || null,
        username: settings.integrations?.trello?.username || null
      }
    };

    res.json({
      success: true,
      integrations
    });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ message: 'Error fetching integrations' });
  }
};

const connectIntegration = async (req, res) => {
  try {
    const { integration } = req.params;
    const { credentials, settings: integrationSettings } = req.body;

    const updateData = {
      [`integrations.${integration}.enabled`]: true,
      [`integrations.${integration}.connected`]: true,
      [`integrations.${integration}.lastSync`]: new Date()
    };

    if (credentials) {
      updateData[`integrations.${integration}.credentials`] = credentials;
    }

    if (integrationSettings) {
      Object.keys(integrationSettings).forEach(key => {
        updateData[`integrations.${integration}.${key}`] = integrationSettings[key];
      });
    }

    const userSettings = await UserSettings.findOneAndUpdate(
      { user: req.user.id },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: `${integration} connected successfully`,
      integration: userSettings.integrations[integration]
    });
  } catch (error) {
    console.error('Error connecting integration:', error);
    res.status(500).json({ message: 'Error connecting integration' });
  }
};

const disconnectIntegration = async (req, res) => {
  try {
    const { integration } = req.params;

    const updateData = {
      [`integrations.${integration}.enabled`]: false,
      [`integrations.${integration}.connected`]: false,
      [`integrations.${integration}.credentials`]: null,
      [`integrations.${integration}.lastSync`]: null
    };

    await UserSettings.findOneAndUpdate(
      { user: req.user.id },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: `${integration} disconnected successfully`
    });
  } catch (error) {
    console.error('Error disconnecting integration:', error);
    res.status(500).json({ message: 'Error disconnecting integration' });
  }
};

const syncIntegration = async (req, res) => {
  try {
    const { integration } = req.params;
    const { direction = 'bidirectional' } = req.body;

    const settings = await UserSettings.findOne({ user: req.user.id });
    
    if (!settings?.integrations?.[integration]?.enabled) {
      return res.status(400).json({ message: 'Integration not enabled' });
    }

    const lastSync = new Date();
    
    await UserSettings.findOneAndUpdate(
      { user: req.user.id },
      { 
        $set: { 
          [`integrations.${integration}.lastSync`]: lastSync 
        } 
      }
    );

    res.json({
      success: true,
      message: `${integration} synced successfully`,
      lastSync
    });
  } catch (error) {
    console.error('Error syncing integration:', error);
    res.status(500).json({ message: 'Error syncing integration' });
  }
};

const getIntegrationStatus = async (req, res) => {
  try {
    const { integration } = req.params;
    
    const settings = await UserSettings.findOne({ user: req.user.id });
    
    if (!settings?.integrations?.[integration]) {
      return res.json({
        success: true,
        status: {
          enabled: false,
          connected: false,
          lastSync: null,
          health: 'disconnected'
        }
      });
    }

    const integrationData = settings.integrations[integration];
    const lastSync = integrationData.lastSync;
    const isHealthy = lastSync && (new Date() - new Date(lastSync)) < 24 * 60 * 60 * 1000;

    res.json({
      success: true,
      status: {
        enabled: integrationData.enabled || false,
        connected: integrationData.connected || false,
        lastSync: lastSync,
        health: isHealthy ? 'healthy' : 'stale'
      }
    });
  } catch (error) {
    console.error('Error fetching integration status:', error);
    res.status(500).json({ message: 'Error fetching integration status' });
  }
};

module.exports = {
  getIntegrations,
  connectIntegration,
  disconnectIntegration,
  syncIntegration,
  getIntegrationStatus
}; 