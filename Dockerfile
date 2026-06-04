# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy all source files including prisma schema
COPY . .

# Install dependencies (npm postinstall will run prisma generate)
RUN npm ci

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy prisma schema before npm install so postinstall can find it
COPY --from=builder /app/prisma ./prisma

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built application and prisma files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Deploy migrations to production database
RUN npm run db:prod

# Expose port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3005/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)});" || exit 1

# Start application
CMD ["node", "dist/index.js"]
