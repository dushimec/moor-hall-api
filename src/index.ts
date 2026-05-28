import app from './server';
import dotenv from 'dotenv';
import prisma from './config/db';

dotenv.config();

const PORT = process.env.PORT || 3005;

// Connect to database and start server
const startServer = async () => {
  try {
    if (process.env.DATABASE_URL) {
      await prisma.$connect();
      console.log('Database connected successfully');
    } else {
      console.log('DATABASE_URL not set; skipping DB connection');
    }

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
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

// Only start server in local development (not in Vercel serverless)
if (!process.env.VERCEL) {
  startServer();
}

// Export app for Vercel serverless functions
export default app;
