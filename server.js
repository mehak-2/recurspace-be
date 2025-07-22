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
if (process.env.NODE_ENV !== 'test' && !allowedOriginsRaw) {
  console.warn('⚠️  Warning: ALLOWED_ORIGINS is not set in .env. CORS may fail.');
}
const allowedOrigins = allowedOriginsRaw
  ? allowedOriginsRaw.split(',').map(origin => origin.trim())
  : [];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const app = express();
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

const PORT = process.env.PORT || 5000;

// ✅ Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 0,
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => process.env.NODE_ENV !== 'production',
});

app.use(helmet());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is required');
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// ✅ API Routes
app.use('/api/users', userRoutes);
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
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'OK',
    message: 'RecurSpace API is running',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// ✅ 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// ✅ Start server
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`RecurSpace server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });

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
