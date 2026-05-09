# Pre-Deployment Checklist

Use this checklist before deploying to Vercel.

## ✅ Code Preparation

- [x] Server modified for serverless compatibility (`src/server.ts`)
- [x] Vercel API entry point created (`api/index.ts`)
- [x] Vercel configuration created (`vercel.json`)
- [x] Build scripts updated (`package.json`)
- [x] Prisma configured for serverless (`src/config/db.ts`)
- [x] Environment variables template created (`.env.production.example`)
- [x] Deployment guide created (`VERCEL_DEPLOY.md`)

## ✅ Database

- [ ] Set up a cloud PostgreSQL database (Neon, Supabase, Railway, etc.)
- [ ] Note the connection string (DATABASE_URL)
- [ ] Ensure database is accessible from Vercel (public connection or whitelist Vercel IPs)
- [ ] Run migrations locally to test: `npx prisma migrate dev`
- [ ] (Optional) Seed database: `npx prisma db seed`

## 🔐 Environment Variables

Set these in Vercel dashboard after deployment:

### Required
- [ ] `DATABASE_URL` - Your PostgreSQL connection string
- [ ] `JWT_SECRET` - Generate with: `openssl rand -base64 32`
- [ ] `JWT_REFRESH_SECRET` - Generate with: `openssl rand -base64 32`
- [ ] `FRONTEND_URL` - Your frontend URL (e.g., https://moor-hall.vercel.app)
- [ ] `BACKEND_URL` - Your API URL (e.g., https://moor-hall-api.vercel.app)

### Recommended (if used in your app)
- [ ] `GOOGLE_CLIENT_ID` - For admin Google login
- [ ] `GOOGLE_CLIENT_SECRET` - For admin Google login
- [ ] `CLOUDINARY_CLOUD_NAME` - For image uploads
- [ ] `CLOUDINARY_API_KEY` - For image uploads
- [ ] `CLOUDINARY_API_SECRET` - For image uploads
- [ ] `SMTP_HOST` - For email (e.g., smtp.gmail.com)
- [ ] `SMTP_PORT` - For email (e.g., 587)
- [ ] `SMTP_USER` - For email
- [ ] `SMTP_PASS` - For email (app password if using Gmail)
- [ ] `STRIPE_SECRET_KEY` - For payments
- [ ] `STRIPE_PUBLISHABLE_KEY` - For payments
- [ ] `STRIPE_WEBHOOK_SECRET` - For payment webhooks
- [ ] `OPENAI_API_KEY` - For AI features (if used)
- [ ] `TWILIO_ACCOUNT_SID` - For SMS (if used)
- [ ] `TWILIO_AUTH_TOKEN` - For SMS (if used)
- [ ] `TWILIO_PHONE_NUMBER` - For SMS (if used)

### Serverless-specific
- [ ] `COOKIE_DOMAIN` - Your domain (e.g., moorhall.com)
- [ ] `COOKIE_SECURE=true` - Must be true in production
- [ ] `COOKIE_SAME_SITE=none` - For cross-site cookies (if frontend on different domain)

## 🚀 Deployment Steps

1. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Deploy via Vercel CLI** (recommended):
   ```bash
   cd moor-hall-api
   npm i -g vercel
   vercel login
   vercel --prod
   ```

   **OR** deploy via GitHub integration:
   - Import project on vercel.com
   - Connect GitHub repo
   - Configure environment variables
   - Deploy

3. **Set environment variables** in Vercel dashboard (if not set during CLI)

4. **Run database migrations**:
   ```bash
   # Option A: Via Vercel console (one-off function)
   npx prisma migrate deploy

   # Option B: Locally with Vercel env
   vercel env pull .env.production
   npx prisma migrate deploy
   ```

5. **Test the deployment**:
   - Health check: `GET /health`
   - API docs: `/api-docs`
   - Test an auth endpoint

6. **Update frontend** to use the deployed API URL

## 🔍 Post-Deployment Verification

- [ ] API responds with 200 on `/health`
- [ ] Swagger docs accessible at `/api-docs`
- [ ] Authentication endpoints work
- [ ] Database queries succeed (check Vercel logs for errors)
- [ ] CORS allows frontend requests
- [ ] File uploads work (if using Cloudinary)
- [ ] Email sending works (if configured)
- [ ] Payment flows work (if using Stripe)

## 🐛 Troubleshooting

### Build Errors
- Check that all dependencies are in `dependencies` (not `devDependencies`) if needed at runtime
- Ensure `prisma generate` runs successfully (postinstall script)
- Verify TypeScript compiles: `npm run build` locally

### Database Connection Issues
- Verify DATABASE_URL is correct
- Ensure database allows connections from Vercel
- For Neon/Supabase: use pooled connection string
- Add `?sslmode=require` if needed

### Function Timeouts
- Increase timeout in `vercel.json` (max 60s on Pro plan)
- Move long operations to background jobs

### Cold Start Performance
- Consider using Vercel Pro plan for faster cold starts
- Keep serverless functions warm with scheduled pings (optional)

## 📚 Resources

- Full deployment guide: `VERCEL_DEPLOY.md`
- Vercel Docs: https://vercel.com/docs
- Prisma + Vercel: https://pris.ly/d/vercel
