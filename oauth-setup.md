# OAuth Setup Guide

## Required Environment Variables

Add these to your `.env` file:

```env
# Google OAuth for Login
GOOGLE_CLIENT_ID=786500657841-i8ctbsncuk3gft51ttlfpn72327kgdc0.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/callback/google

# Google Calendar Integration
GOOGLE_CALENDAR_CLIENT_ID=786500657841-i8ctbsncuk3gft51ttlfpn72327kgdc0.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=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
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/oauth/callback/google-calendar

# GitHub OAuth for Login
GITHUB_CLIENT_ID=Ov23liY0ILjUvLv6eNFu
GITHUB_CLIENT_SECRET=c0dbbc14c8170215cea5dca12240d420edf08b63
GITHUB_REDIRECT_URI=http://localhost:3000/oauth/callback/github

# GitHub Integration
GITHUB_INTEGRATION_CLIENT_ID=Ov23liY0ILjUvLv6eNFu
GITHUB_INTEGRATION_CLIENT_SECRET=c0dbbc14c8170215cea5dca12240d420edf08b63
GITHUB_INTEGRATION_REDIRECT_URI=http://localhost:3000/oauth/callback/github

# Slack Integration
SLACK_CLIENT_ID=9224360267702.9224363419702
SLACK_CLIENT_SECRET=65712717a9159261f500db4ff888cd21
SLACK_REDIRECT_URI=http://localhost:3000/oauth/callback/slack
```


## Setup Instructions

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and Google Calendar API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set Application Type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/oauth/callback/google` (for login)
   - `http://localhost:3000/oauth/callback/google-calendar` (for calendar integration)
7. Copy Client ID and Client Secret to your `.env` file

### 2. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the form:
   - Application name: RecurSpace
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/oauth/callback/github`
4. Copy Client ID and Client Secret to your `.env` file

### 3. Slack OAuth Setup

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Fill in the form and create the app
4. Go to "OAuth & Permissions"
5. Add redirect URLs: `http://localhost:3000/oauth/callback/slack`
6. Add required scopes:
   - `channels:read`
   - `chat:write`
   - `channels:history`
7. Install the app to your workspace
8. Copy Client ID and Client Secret to your `.env` file

## Testing OAuth

1. Start your backend server
2. Start your frontend application
3. Go to Integrations page
4. Click "Connect" on any integration
5. You should be redirected to the OAuth provider
6. After authorization, you'll be redirected back to RecurSpace
7. The integration should show as "Connected"

## Production Setup

For production, update the redirect URIs to your domain:

```env
GOOGLE_REDIRECT_URI=https://yourdomain.com/oauth/callback/google
GITHUB_REDIRECT_URI=https://yourdomain.com/oauth/callback/github
SLACK_REDIRECT_URI=https://yourdomain.com/oauth/callback/slack
```


---

## **How to Fix**

### 1. Make sure your backend `.env` file is correct

Your `recurspace-be/.env` should have:
```
GOOGLE_CLIENT_ID=786500657841-i8ctbsncuk3gft51ttlfpn72327kgdc0.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/callback/google

GOOGLE_CALENDAR_CLIENT_ID=786500657841-i8ctbsncuk3gft51ttlfpn72327kgdc0.apps.googleusercontent.com
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/oauth/callback/google-calendar

GITHUB_CLIENT_ID=Ov23liY0ILjUvLv6eNFu
GITHUB_CLIENT_SECRET=c0dbbc14c8170215cea5dca12240d420edf08b63
GITHUB_REDIRECT_URI=http://localhost:3000/oauth/callback/github

GITHUB_INTEGRATION_CLIENT_ID=Ov23liY0ILjUvLv6eNFu
GITHUB_INTEGRATION_CLIENT_SECRET=c0dbbc14c8170215cea5dca12240d420edf08b63
GITHUB_INTEGRATION_REDIRECT_URI=http://localhost:3000/oauth/callback/github

SLACK_CLIENT_ID=9224360267702.9224363419702
SLACK_CLIENT_SECRET=65712717a9159261f500db4ff888cd21
SLACK_REDIRECT_URI=http://localhost:3000/oauth/callback/slack
```

### 2. Make sure your backend loads the `.env` file

At the very top of your `recurspace-be/server.js` (or `index.js`), you should have:
```js
require('dotenv').config();
```
If this is missing, add it as the first line.

### 3. Restart your backend server

After any change to `.env`, you **must** restart the backend:
```bash
cd recurspace-be
npm start
```

### 4. Confirm the backend is returning the correct URLs

Test this endpoint in your browser or with curl:
```
http://localhost:5000/api/oauth/urls
```
You should see JSON with real URLs (not `undefined`).

### 5. Make sure your frontend is using the backend-provided URLs

Your frontend should **not** build the OAuth URL itself. It should use the URL from the backend, like this:
```js
const oauthUrl = oauthUrls.googleCalendar?.authUrl;
window.location.href = oauthUrl;
```
This is already how your `Integrations.tsx` is set up.

---

## **Summary Table**

| Approach         | Secure? | Exposes secrets? | Recommended? | Your Codebase |
|------------------|---------|------------------|--------------|--------------|
| .env in frontend | Yes     | No (if only client_id) | OK for public values | Not used      |
| Backend endpoint | Yes     | No               | **Best**     | ✅ Used       |

---

## **What to do next**

- **Check your backend `.env` file** for the correct values.
- **Restart your backend** after any changes.
- **Test `/api/oauth/urls`** to confirm it returns real URLs.
- **Try connecting an integration again.**

If you want to use the frontend `.env` approach, let me know and I’ll walk you through it.  
Otherwise, your current backend-driven approach is correct—just make sure the backend is configured and running properly!

Would you like help checking your backend `.env` or testing the `/api/oauth/urls` endpoint?


---

## **How to Fix This**

### 1. Check your backend `.env` file

Make sure you have these lines in `recurspace-be/.env` (not just in `env.example`):

```
GOOGLE_CLIENT_ID=786500657841-i8ctbsncuk3gft51ttlfpn72327kgdc0.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/callback/google

GOOGLE_CALENDAR_CLIENT_ID=786500657841-i8ctbsncuk3gft51ttlfpn72327kgdc0.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=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
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/oauth/callback/google-calendar
```

### 2. Make sure your backend loads the `.env` file

At the **very top** of your `recurspace-be/server.js` (or `index.js`), you must have:
```js
require('dotenv').config();
```
If this is missing, add it as the first line.

### 3. Restart your backend server

After making any changes to `.env`, **restart your backend**:
```bash
cd recurspace-be
npm start
```

### 4. Test the backend endpoint

Open this URL in your browser:
```
http://localhost:5000/api/oauth/urls
```
You should see real URLs with your client IDs and redirect URIs, **not** `undefined`.

---

## **Why this happens**

- If `.env` is missing or not loaded, `process.env.GOOGLE_CLIENT_ID` and others will be `undefined`.
- The backend then builds the OAuth URL with `undefined` values, which the frontend uses.

---

## **Summary**

- This is a backend `.env` or server config issue.
- Fix your `.env`, ensure it's loaded, and restart the backend.
- The frontend will then get the correct URLs.

---

**If you want, paste the output of `http://localhost:5000/api/oauth/urls` here and I can confirm if it's correct.**  
Or, let me know if you want step-by-step help checking your backend config!

