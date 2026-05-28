import dotenv from 'dotenv';
dotenv.config();

import app from './server.js';
import prisma from './config/db.js';

const PORT = process.env.PORT || 3005;

/**
 * =========================
 * LOCAL DEVELOPMENT ONLY
 * =========================
 */
const startServer = async () => {
  try {
    // Connect DB ONLY in local (not serverless)
    if (!process.env.VERCEL && process.env.DATABASE_URL) {
      await prisma.$connect();
      console.log('Database connected successfully');
    }

    // Only listen in local development
    if (!process.env.VERCEL) {
      const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Swagger: http://localhost:${PORT}/api-docs`);
      });

      // Graceful shutdown (local only)
      process.on('SIGTERM', async () => {
        console.log('SIGTERM received, shutting down...');
        if (process.env.DATABASE_URL) {
          await prisma.$disconnect();
        }
        server.close(() => {
          console.log('Server closed');
          process.exit(0);
        });
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * =========================
 * RUN ONLY IN LOCAL
 * =========================
 */
if (!process.env.VERCEL) {
  startServer();
}

export default app;