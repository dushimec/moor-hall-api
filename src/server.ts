import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import mainRoutes from './routes/index.js';
import { notFoundHandler } from './middlewares/error.middleware.js';
import swaggerSpecs from './config/swagger.js';

const app = express();

/**
 * =========================
 * MIDDLEWARE
 * =========================
 */
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
      : ['https://moorhall.com', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(morgan('dev'));

/**
 * =========================
 * SWAGGER
 * =========================
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

/**
 * =========================
 * ROUTES
 * =========================
 */
const apiPath = process.env.API_PATH || '/api/v1';
app.use(apiPath, mainRoutes);

/**
 * =========================
 * ROOT
 * =========================
 */
app.get('/', (req, res) => {
  res.send('Welcome to the MoorHall API 🚀');
});

/**
 * =========================
 * HEALTH CHECK (NO DB CALLS)
 * =========================
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/**
 * =========================
 * ERROR HANDLERS
 * =========================
 */
app.use(notFoundHandler);

app.use(
  (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', {
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
  }
);

export default app;