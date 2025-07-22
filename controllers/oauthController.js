import User from '../models/User.js'
import UserSettings from '../models/UserSettings.js'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import qs from 'qs'

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const googleAuth = async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ message: 'Authorization code required' });
    }

    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.GOOGLE_REDIRECT_URI
    });

    const { access_token } = tokenResponse.data;

  
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { id, email, name, picture } = userResponse.data;

  
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: id,
        avatar: picture,
        isEmailVerified: true
      });
    } else {
    
      user.googleId = id;
      user.avatar = picture;
      user.isEmailVerified = true;
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

// GitHub OAuth for Login
const githubAuth = async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ message: 'Authorization code required' });
    }

    // Exchange code for tokens
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    }, {
      headers: { Accept: 'application/json' }
    });

    const { access_token } = tokenResponse.data;

    // Get user info from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { id, login, email, name, avatar_url } = userResponse.data;

    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        name: name || login,
        email,
        githubId: id,
        avatar: avatar_url,
        isEmailVerified: true
      });
    } else {
      // Update existing user with GitHub info
      user.githubId = id;
      user.avatar = avatar_url;
      user.isEmailVerified = true;
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({ message: 'GitHub authentication failed' });
  }
};

// Google Calendar Integration OAuth
const googleCalendarAuth = async (req, res) => {
  try {
    const { code } = req.query;
    const userId = req.user.id;
    
    if (!code) {
      return res.status(400).json({ message: 'Authorization code required' });
    }

    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CALENDAR_CLIENT_ID,
      client_secret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.GOOGLE_CALENDAR_REDIRECT_URI
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Store integration credentials
    await UserSettings.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          'integrations.calendar.enabled': true,
          'integrations.calendar.connected': true,
          'integrations.calendar.provider': 'google',
          'integrations.calendar.lastSync': new Date(),
          'integrations.calendar.credentials': {
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresAt: new Date(Date.now() + expires_in * 1000),
            tokenType: 'Bearer',
            scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events'
          }
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Google Calendar connected successfully',
      integration: {
        enabled: true,
        connected: true,
        lastSync: new Date(),
        provider: 'google'
      }
    });
  } catch (error) {
    console.error('Google Calendar OAuth error:', error);
    res.status(500).json({ message: 'Google Calendar connection failed' });
  }
};

// GitHub Integration OAuth
const githubIntegrationAuth = async (req, res) => {
  try {
    const { code } = req.query;
    const userId = req.user.id;
    
    if (!code) {
      return res.status(400).json({ message: 'Authorization code required' });
    }

    // Exchange code for tokens
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_INTEGRATION_CLIENT_ID,
      client_secret: process.env.GITHUB_INTEGRATION_CLIENT_SECRET,
      code
    }, {
      headers: { Accept: 'application/json' }
    });

    const { access_token } = tokenResponse.data;

    // Get user info to store username
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { login } = userResponse.data;

    // Store integration credentials
    await UserSettings.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          'integrations.github.enabled': true,
          'integrations.github.connected': true,
          'integrations.github.lastSync': new Date(),
          'integrations.github.username': login,
          'integrations.github.credentials': {
            accessToken: access_token,
            tokenType: 'Bearer',
            scope: 'repo issues pull_requests'
          }
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'GitHub connected successfully',
      integration: {
        enabled: true,
        connected: true,
        lastSync: new Date(),
        username: login
      }
    });
  } catch (error) {
    console.error('GitHub Integration OAuth error:', error);
    res.status(500).json({ message: 'GitHub connection failed' });
  }
};

// Slack Integration OAuth
const slackIntegrationAuth = async (req, res) => {
  try {
    const { code } = req.query;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code required' });
    }

    const tokenResponse = await axios.post(
      'https://slack.com/api/oauth.v2.access',
      qs.stringify({
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code,
        redirect_uri: process.env.SLACK_REDIRECT_URI
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    if (!tokenResponse.data.ok) {
      console.error('Slack OAuth error:', tokenResponse.data);
      return res.status(400).json({ message: 'Slack OAuth error', details: tokenResponse.data });
    }

    const { access_token, team } = tokenResponse.data;

    await UserSettings.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          'integrations.slack.enabled': true,
          'integrations.slack.connected': true,
          'integrations.slack.lastSync': new Date(),
          'integrations.slack.workspace': team?.name,
          'integrations.slack.credentials': {
            accessToken: access_token,
            tokenType: 'Bearer',
            scope: 'channels:read chat:write channels:history'
          }
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Slack connected successfully',
      integration: {
        enabled: true,
        connected: true,
        lastSync: new Date(),
        workspace: team?.name
      }
    });
  } catch (error) {
    console.error('Slack Integration OAuth error:', error?.response?.data || error);
    res.status(500).json({ message: 'Slack connection failed', details: error?.response?.data || error.message });
  }
};

// Get OAuth URLs for frontend
const getOAuthUrls = async (req, res) => {
  try {
    const urls = {
      google: {
        authUrl: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI)}&scope=${encodeURIComponent('email profile')}&response_type=code`,
        scope: 'email profile'
      },
      github: {
        authUrl: `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GITHUB_REDIRECT_URI)}&scope=${encodeURIComponent('user:email')}&response_type=code`,
        scope: 'user:email'
      },
      googleCalendar: {
        authUrl: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CALENDAR_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALENDAR_REDIRECT_URI)}&scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events')}&response_type=code`,
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events'
      },
      githubIntegration: {
        authUrl: `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_INTEGRATION_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GITHUB_INTEGRATION_REDIRECT_URI)}&scope=${encodeURIComponent('repo issues pull_requests')}&response_type=code`,
        scope: 'repo issues pull_requests'
      },
      slack: {
        authUrl: `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.SLACK_REDIRECT_URI)}&scope=${encodeURIComponent('channels:read chat:write channels:history')}&response_type=code`,
        scope: 'channels:read chat:write channels:history'
      }
    };

    res.json({
      success: true,
      urls
    });
  } catch (error) {
    console.error('Error getting OAuth URLs:', error);
    res.status(500).json({ message: 'Failed to get OAuth URLs' });
  }
};

export {
  googleAuth,
  githubAuth,
  googleCalendarAuth,
  githubIntegrationAuth,
  slackIntegrationAuth,
  getOAuthUrls
}; 