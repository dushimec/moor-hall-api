# Vercel Deployment Guide

This guide covers deploying the Moor Hall API to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to a GitHub repository
3. **Cloud PostgreSQL Database**: Set up a database (recommended providers):
   - [Neon](https://neon.tech) (free tier available)
   - [Supabase](https://supabase.com) (free tier available)
   - [Railway](https://railway.app) (free tier available)
   - AWS RDS, Google Cloud SQL, etc.

## Pre-Deployment Setup

### 1. Database Setup

Create a PostgreSQL database and note the connection string. It should look like:
```
postgresql://user:password@host:port/database?schema=public
```

### 2. Environment Variables

Copy `.env.production.example` to `.env` (for local production testing) and configure all required variables.

**Critical variables for Vercel:**
- `DATABASE_URL` - Your cloud PostgreSQL connection string
- `JWT_SECRET` - Generate a secure random string (min 32 chars)
- `JWT_REFRESH_SECRET` - Another secure random string
- `FRONTEND_URL` - Your deployed frontend URL (e.g., https://moor-hall.vercel.app)
- `BACKEND_URL` - Your deployed API URL (e.g., https://moor-hall-api.vercel.app)

**Optional integrations** (enable as needed):
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `CLOUDINARY_*` - For image uploads
- `TWILIO_*` - For SMS notifications
- `STRIPE_*` - For payments
- `OPENAI_API_KEY` - For AI features
- `FIREBASE_SERVICE_JSON_PATH` - For push notifications

### 3. Update CORS Settings

The CORS configuration in `src/server.ts` uses `origin: true`, which will automatically allow your frontend URL in production. Ensure `FRONTEND_URL` is set correctly.

### 4. Cookie Configuration

For production, update cookie settings in your environment:
```
COOKIE_DOMAIN=your-domain.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
```

## Deployment Steps

### Option A: Deploy via Vercel CLI (Recommended for first deployment)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from the API directory**:
   ```bash
   cd moor-hall-api
   vercel --prod
   ```

4. **Follow the prompts**:
   - Set up and deploy: Yes
   - Link to existing project: No (first time)
   - Project name: moor-hall-api (or your preferred name)
   - Directory: `.` (current directory)
   - Want to override settings: No

5. **Set Environment Variables in Vercel Dashboard**:
   - Go to your project settings on vercel.com
   - Navigate to "Environment Variables"
   - Add all required variables from `.env.production.example`
   - **Important**: Set `VERCEL=1` (Vercel sets this automatically, but good to be aware)

6. **Redeploy** (if you added env vars after first deploy):
   ```bash
   vercel --prod --force
   ```

### Option B: Deploy via GitHub Integration

1. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import project on Vercel**:
   - Go to [vercel.com/import](https://vercel.com/import)
   - Select your GitHub repository
   - Vercel will detect the `vercel.json` configuration

3. **Configure environment variables**:
   - In the Vercel dashboard, go to your project
   - Settings → Environment Variables
   - Add all required variables

4. **Deploy**:
   - Click "Deploy" or push to main branch to trigger automatic deployment

## Post-Deployment

### 1. Database Migrations

After deployment, run database migrations:

**Option A: Via Vercel CLI**:
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

**Option B: Via Vercel Console** (run as one-off command):
- Go to your project on Vercel
- Navigate to "Functions" → "Run"
- Execute: `npx prisma migrate deploy`

**Option C: Connect to your database directly** and run migrations from your local machine:
```bash
# Pull Vercel environment variables
vercel env pull .env.production

# Run migrations
npx prisma migrate deploy
```

### 2. Seed Database (Optional)

If you need seed data:
```bash
npx prisma db seed
```

### 3. Test Your API

- Health check: `GET https://your-api-domain.vercel.app/health`
- API docs: `https://your-api-domain.vercel.app/api-docs`
- Test endpoint: `GET https://your-api-domain.vercel.app/api/v1/auth/check`

### 4. Update Frontend Configuration

Update your frontend (`client/.env`) to point to the deployed API:
```
VITE_API_URL=https://your-api-domain.vercel.app
```

## Important Notes

### Serverless Considerations

1. **Cold Starts**: The first request after a period of inactivity may be slower (1-3 seconds). This is normal for serverless functions.

2. **Database Connections**: 
   - Use a connection pooler like PgBouncer (recommended for high traffic)
   - Neon and Supabase provide built-in connection pooling
   - Add `?connection_limit=1` to your DATABASE_URL if experiencing connection issues

3. **Prisma in Serverless**:
   - The Prisma client is initialized globally to reuse connections
   - Connection pooling is automatically managed
   - For high-traffic apps, consider using `prisma.$disconnect()` in a cleanup function

4. **File Uploads**: 
   - Cloudinary is configured for file uploads (works in serverless)
   - Temporary local file storage is not persistent; always use cloud storage

5. **Rate Limiting**: Express rate limiter is enabled. Adjust limits in `src/middlewares/rateLimit.middleware.ts` if needed.

6. **Timeouts**: Vercel serverless functions have a 10-second timeout on Hobby plan, 60 seconds on Pro. Long-running operations should be moved to background jobs.

### Monitoring & Logs

- View logs in Vercel dashboard: Project → Functions → Logs
- Use `console.log` for debugging (outputs to Vercel logs)
- Set up error tracking (Sentry, LogRocket, etc.) for production

### Custom Domain (Optional)

1. In Vercel dashboard: Project Settings → Domains
2. Add your custom domain (e.g., `api.moorhall.com`)
3. Update DNS records as instructed by Vercel
4. Update `BACKEND_URL` environment variable

### SSL/CORS

- Vercel provides automatic SSL
- CORS is configured to allow your frontend URL
- For multiple frontend domains, update the CORS configuration in `src/server.ts`

## Troubleshooting

### Build Fails

- Ensure all dependencies are in `package.json` (not `devDependencies` if needed at runtime)
- Check that `prisma generate` runs successfully (postinstall script handles this)
- Verify TypeScript compilation: `npm run build` locally

### Database Connection Errors

- Verify `DATABASE_URL` is correct and accessible from Vercel
- Ensure your database allows connections from Vercel's IP ranges (or set to "public" access)
- For Neon/Supabase: enable "pooled connections" and use the connection string they provide
- Add `?sslmode=require` to DATABASE_URL if required by your database

### Function Timeout

- Increase timeout in `vercel.json` (max 60s for Pro plan):
  ```json
  {
    "functions": {
      "api/**/*.ts": {
        "maxDuration": 60
      }
    }
  }
  ```
- Move heavy operations to background jobs (BullMQ, Agenda, etc.)

### Prisma Client Not Found

- Ensure `prisma generate` runs during build (postinstall script)
- Check that `@prisma/client` is in dependencies (not devDependencies)
- Rebuild: `vercel --force --prod`

### Environment Variables Not Available

- Vercel automatically sets `NODE_ENV=production`
- All custom env vars must be set in Vercel dashboard
- Use `vercel env pull .env.production` to test locally with Vercel env

## Cost Optimization

- Vercel Hobby plan is free (with limits)
- Database: Use Neon/Supabase free tiers
- Cloud storage: Cloudinary free tier
- Email: Use transactional email services with free tiers (Resend, SendGrid)

## Support

- Vercel Docs: https://vercel.com/docs
- Prisma + Vercel: https://www.prisma.io/docs/guides/database/connection-pooling/serverless
- Express on Vercel: https://vercel.com/guides/using-express-with-vercel
