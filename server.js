import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';
dotenv.config();

import rateLimit from 'express-rate-limit';

import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import suggestionRoutes from './routes/suggestionRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';
import aiOptimizerRoutes from './routes/aiOptimizerRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';
import securityRoutes from './routes/securityRoutes.js';
import oauthRoutes from './routes/oauthRoutes.js';
import slackRoutes from './routes/slackRoutes.js';

import { authMiddleware } from './middleware/authMiddleware.js';

// ✅ Handle ALLOWED_ORIGINS from .env
const allowedOriginsRaw = process.env.ALLOWED_ORIGINS;
if (process.env.NODE_ENV !== 'development' && !allowedOriginsRaw) {
  console.warn('⚠️  Warning: ALLOWED_ORIGINS is not set in .env. CORS may fail.');
}
// Split the ALLOWED_ORIGINS string into an array, trimming whitespace for each origin.
// This allows for multiple origins to be specified in the .env (e.g., "http://localhost:5173,https://your-prod-domain.com").
// If only one origin is specified, it will still result in an array with a single element.
const allowedOrigins = allowedOriginsRaw
  ? allowedOriginsRaw.split(',').map(origin => origin.trim())
  : [];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    // Check if the requesting origin is in our list of allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // If the origin is not allowed, reject the request
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Essential for sending cookies, authorization headers etc.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed request headers
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204 for preflight
  maxAge: 86400 // Cache preflight responses for 24 hours to reduce OPTIONS requests
};

const app = express();
app.use(cors(corsOptions));
// Handle preflight requests for all routes using the same CORS options
app.options('*', cors(corsOptions));

const PORT = process.env.PORT || 5000;

// ✅ Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 0, // 100 requests per 15 minutes in production, unlimited in development
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => process.env.NODE_ENV !== 'production', // Skip rate limiting in development
});

app.use(helmet()); // Apply security headers
app.use(limiter); // Apply rate limiting
app.use(express.json({ limit: '10mb' })); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// ✅ Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is required');
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Timeout for socket operations
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Log MongoDB connection errors
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    // Log MongoDB disconnection
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Gracefully close MongoDB connection on app termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Exit process with failure
  }
};

// ✅ API Routes
app.use('/api/users', userRoutes);
// Apply authMiddleware to protected routes
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/suggestions', authMiddleware, suggestionRoutes);
app.use('/api/workflows', authMiddleware, workflowRoutes);
app.use('/api/ai-optimizer', authMiddleware, aiOptimizerRoutes);
app.use('/api/templates', authMiddleware, templateRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/billing', authMiddleware, billingRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/integrations', authMiddleware, integrationRoutes);
app.use('/api/security', authMiddleware, securityRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/slack', slackRoutes);

// ✅ Health check route
app.get('/api/health', (req, res) => {
  console.log("ENV", process.env.NODE_ENV, allowedOrigins, corsOptions);
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'OK',
    message: 'RecurSpace API is running>',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins,
    corsOptions: corsOptions,
  });
});

// ✅ 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  res.status(500).json({ message: 'Something went wrong!' });
});

// ✅ Start server
const startServer = async () => {
  try {
    await connectDB(); // Connect to MongoDB first

    const server = app.listen(PORT, () => {
      console.log(`RecurSpace server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });

    // Handle server errors, specifically EADDRINUSE (port already in use)
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Try a different port.`);
        process.exit(1);
      } else {
        console.error('Server error:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;
