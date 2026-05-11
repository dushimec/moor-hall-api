import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import mainRoutes from './routes/index';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import swaggerSpecs from './config/swagger';
import prisma from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.get('/health', async (req, res) => {
  const timestamp = new Date().toISOString();

  // If DATABASE_URL is not configured, return a DB-free healthy response.
  if (!process.env.DATABASE_URL) {
    return res.json({ status: 'ok', database: 'not-configured', timestamp });
  }

  try {
    // Test database connection (lazy-initializes Prisma)
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ status: 'ok', database: 'connected', timestamp });
  } catch (error) {
    console.error('Health check DB error:', error);
    // Still return 200 so the endpoint is DB-free and doesn't cause function failures
    return res.json({ status: 'ok', database: 'disconnected', error: String(error), timestamp });
  }
});

app.use('/api/v1', mainRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// Start the server
const startServer = async () => {
  try {
    if (process.env.DATABASE_URL) {
      await prisma.$connect();
      console.log('Database connected successfully');
    } else {
      console.log('DATABASE_URL not set; skipping DB connection');
    }

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
    });

    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, closing server...');
      if (process.env.DATABASE_URL) await prisma.$disconnect();
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;