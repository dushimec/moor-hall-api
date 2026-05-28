// 1️⃣ Load dotenv immediately
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import mainRoutes from './routes/index';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import swaggerSpecs from './config/swagger';
import prisma from './config/db';
import transporterManager from './emails/config/transporter.config';

const app = express();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',')
    : ['https://moorhall.com', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(morgan('dev'));

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the MoorHall API 🚀');
});

// Health check route
app.get('/health', async (req, res) => {
  const timestamp = new Date().toISOString();

  if (!process.env.DATABASE_URL) {
    return res.json({ status: 'ok', database: 'not-configured', timestamp });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ status: 'ok', database: 'connected', timestamp });
  } catch (error) {
    console.error('Health check DB error:', error);
    return res.json({ status: 'ok', database: 'disconnected', error: String(error), timestamp });
  }
});

// Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(5 * 60 * 1000);
  res.setTimeout(5 * 60 * 1000);
  next();
});

// API routes
const apiPath = process.env.API_PATH || '/api/v1';
app.use(apiPath, mainRoutes);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  if (res.headersSent) return next(err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

app.use(notFoundHandler);

/**
 * 🔑 IMPORTANT:
 * - NO app.listen()
 * - NO createServer()
 * - DEFAULT EXPORT REQUIRED
 */

// Initialize services on cold start
(async () => {
  try {
    if (process.env.DATABASE_URL) {
      await prisma.$connect();
      console.log('Database connected successfully');
    }
  } catch (error) {
    console.error('Database connection failed:', error);
  }

  try {
    await transporterManager.verifyAll();
    console.log('[Email] Transporter verification completed. Health:', transporterManager.getHealthStatus());
  } catch (err) {
    console.warn('[Email] Transporter verification encountered errors:', err instanceof Error ? err.message : String(err));
  }
})();

export default app;