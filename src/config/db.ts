import { PrismaClient } from '@prisma/client';

// For serverless environments, we need to handle connection pooling carefully
const isVercel = !!process.env.VERCEL || process.env.VERCEL === '1' || process.env.VERCEL === 'true';
const isProduction = process.env.NODE_ENV === 'production';

// Create a global prisma instance to avoid creating multiple connections
let prisma: PrismaClient;

// In serverless environments, it's recommended to use a connection string with pool settings
// Example: postgresql://.../?connection_limit=1&pool_timeout=0
// Or set DATABASE_URL with appropriate parameters for your database provider

if (isVercel || isProduction) {
  // In serverless/production, use minimal logging
  prisma = new PrismaClient({
    log: ['error'],
  });
} else {
  // In development, use default settings with query logging
  prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
}

export default prisma;