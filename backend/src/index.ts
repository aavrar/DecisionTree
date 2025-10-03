import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import authRoutes from './routes/authRoutes';
import decisionRoutes from './routes/decisionRoutes';
import analysisRoutes from './routes/analysisRoutes';
import locationRoutes from './routes/locationRoutes';
import { cleanupService } from './services/cleanupService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
  'http://localhost:3000',
  'https://branches.aahadv.com',
  process.env.CORS_ORIGIN
].filter(Boolean);

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/decisions', decisionRoutes);
app.use('/api/decisions', analysisRoutes);
app.use('/api/locations', locationRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'DecisionTree API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

const startServer = async () => {
  try {
    await connectDatabase();

    // Start cleanup service for archived decisions
    cleanupService.start();

    app.listen(PORT, () => {
      console.log(`
DecisionTree Backend Server Started
Port: ${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
Health Check: http://localhost:${PORT}/api/health
API Base: http://localhost:${PORT}/api
Cleanup Service: Active (7-day auto-delete for archived decisions)
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.log('Uncaught Exception thrown:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  cleanupService.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  cleanupService.stop();
  process.exit(0);
});

startServer();