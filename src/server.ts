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
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1', mainRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// Only start the server if not running in serverless environment
if (!isVercel) {
  const startServer = async () => {
    try {
      await prisma.$connect();
      console.log('Database connected successfully');
      
      const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
      });

      process.on('SIGTERM', async () => {
        console.log('SIGTERM received, closing server...');
        await prisma.$disconnect();
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
}

// For serverless: connect Prisma on cold start
if (isVercel) {
  prisma.$connect().catch(console.error);
}

export default app;