# Moor Hall API

Backend API for the Moor Hall restaurant management system, built with Express.js, TypeScript, Prisma, and PostgreSQL.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (admin/customer)
- **Menu Management**: Categories, menu items, pricing
- **Order Management**: Full order lifecycle with status tracking
- **Reservation System**: Table reservations with date/time management
- **Catering Services**: Event and catering order management
- **Payment Processing**: Stripe integration for payments
- **Notifications**: Email (SMTP), SMS (Twilio/Pindo), WhatsApp Cloud API
- **Content Management**: Dynamic content updates (hero, about, etc.)
- **Reporting**: Sales, orders, reservations reports
- **File Uploads**: Cloudinary integration for images
- **API Documentation**: Auto-generated Swagger docs at `/api-docs`

## Tech Stack

- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Google OAuth (optional)
- **File Storage**: Cloudinary
- **Payments**: Stripe
- **Messaging**: Twilio, Pindo, WhatsApp Cloud API
- **Deployment**: Render

## Project Structure

```
moor-hall-api/
├── api/              # API entry point
│   └── index.ts      # Express app handler
├── src/
│   ├── config/      # Configuration (db, swagger)
│   ├── controllers/ # Request handlers
│   ├── docs/        # API documentation (Swagger)
│   ├── gateways/    # External service integrations
│   ├── middlewares/ # Express middlewares
│   ├── routes/      # Route definitions
│   ├── types/       # TypeScript types
│   └── server.ts    # Express app configuration
├── prisma/          # Database schema & migrations
├── .env             # Local environment variables
├── render.yaml      # Render deployment config
└── package.json
```

## Quick Start

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- npm or yarn

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd moor-hall-api
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env .env
   # Edit .env with your configuration
   ```

   Minimum required for local development:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/moor_db?schema=public"
   JWT_SECRET="your-secret-key"
   JWT_REFRESH_SECRET="your-refresh-secret-key"
   FRONTEND_URL="http://localhost:5173"
   BACKEND_URL="http://localhost:3005"
   ```

3. **Set up the database**:
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run migrations
   npm run db:migrate

   # (Optional) Seed database
   npm run db:seed
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

   Server will start at http://localhost:3005

   - API: http://localhost:3005/api/v1
   - Health check: http://localhost:3005/health
   - API Docs: http://localhost:3005/api-docs

## Development

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload (nodemon) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server (from `dist/`) |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Create and apply new migration |
| `npm run db:push` | Push schema changes to database (no migration) |
| `npm run db:prod` | Run migrations in production |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:seed` | Seed database with initial data |

### Environment Variables

See `.env.production.example` for all available configuration options.

**Key variables**:

- `NODE_ENV` - `development` or `production`
- `PORT` - Server port (default: 3005)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for signing access tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `FRONTEND_URL` - Frontend URL (for CORS and cookies)
- `BACKEND_URL` - Backend URL (for links in emails, etc.)

### Database Workflow

1. **Update schema**: Edit `prisma/schema.prisma`
2. **Generate migration**: `npm run db:migrate` (creates new migration file)
3. **Apply to database**: Migration is automatically applied
4. **Generate client**: `npm run db:generate` (updates Prisma client)

> **Note**: In production, use `npm run db:prod` to apply migrations without creating new ones.

### API Documentation

Swagger documentation is automatically generated from JSDoc comments.

- **Local**: http://localhost:3005/api-docs
- **Production**: `https://your-api.onrender.com/api-docs`

## Production Deployment

### Render Deployment

This API is configured for deployment on Render.

**Quick deploy**:
```bash
cd moor-hall-api
git push origin main
```

Render will automatically detect the `render.yaml` configuration and deploy.

**Prerequisites**:
- Cloud PostgreSQL database (Neon, Supabase, Railway, etc.)
- All required environment variables set in Render dashboard

### Environment Variables for Production

Set these in Render dashboard (Environment → Environment Variables):

**Required**:
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `FRONTEND_URL` (your deployed frontend)
- `BACKEND_URL` (your deployed API URL)

**Optional** (based on features used):
- Email (SMTP), Cloudinary, Stripe, Twilio, etc.

### Database Migrations on Production

Migrations are automatically run during deployment via the `render.yaml` configuration.

## Architecture

### Server Modes

The server supports standalone mode (development and production):
- Starts HTTP server on specified port

### Middlewares

- `helmet` - Security headers
- `cors` - Cross-origin resource sharing
- `morgan` - Request logging
- `cookie-parser` - Cookie parsing
- `express.json/urlencoded` - Body parsing
- `rate-limit` - Rate limiting (configured per route)
- `auth` - JWT verification (protected routes)
- `role` - Role-based access control
- `validate` - Request validation (Zod)
- `error` - Centralized error handling

### Database Connection

- **Development**: Direct connection with query logging
- **Production**: Optimized for connection pooling
  - Uses global PrismaClient instance
  - Minimal logging
  - Connection pool size managed via DATABASE_URL params

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register customer
- `POST /api/v1/auth/login` - Login customer
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/check` - Check authentication status
- `POST /api/v1/auth/admin/login` - Admin login (Google OAuth)

### Admin Routes (require admin role)
- `GET /api/v1/admin/dashboard` - Dashboard stats
- `GET /api/v1/admin/orders` - List all orders
- `GET /api/v1/admin/reservations` - List all reservations
- `GET /api/v1/admin/customers` - List all customers
- `GET /api/v1/admin/menu-items` - Manage menu items
- `GET /api/v1/admin/categories` - Manage categories
- `GET /api/v1/admin/content` - Manage content
- `GET /api/v1/admin/settings` - Manage settings
- `GET /api/v1/admin/reports` - Generate reports
- `GET /api/v1/admin/activities` - Activity logs

### Customer Routes
- `GET /api/v1/menu` - Get public menu
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - Get customer orders
- `POST /api/v1/reservations` - Create reservation
- `GET /api/v1/reservations` - Get customer reservations

### Webhooks
- `POST /api/v1/webhooks/stripe` - Stripe payment webhooks
- `POST /api/v1/webhooks/whatsapp` - WhatsApp messages

## Security

- **JWT Authentication**: Access tokens (15min) and refresh tokens (7days)
- **Password Hashing**: bcryptjs
- **Helmet**: Security headers
- **CORS**: Configured for specific origins
- **Rate Limiting**: Per-route limits to prevent abuse
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection**: Prevented by Prisma ORM

## Performance

- **Database**: Connection pooling (PgBouncer recommended for high traffic)
- **Caching**: Consider Redis for sessions and frequently accessed data

## Monitoring

- **Render Logs**: View in dashboard
- **Database**: Use Prisma Studio or database GUI
- **Error Tracking**: Integrate Sentry, LogRocket, etc. (optional)

## Troubleshooting

### Common Issues

1. **Database connection fails**
   - Check DATABASE_URL is correct
   - Ensure database is running and accessible
   - Use public connection or whitelist Render IPs

2. **Prisma client not found**
   - Run `npm run db:generate`
   - Ensure `@prisma/client` is in dependencies

3. **Build fails on Render**
   - Check all env vars are set in Render dashboard
   - Ensure postinstall script runs successfully
   - View build logs in Render dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with clear commit messages
4. Test locally
5. Submit a pull request

## License

ISC

## Support

For questions, contact the development team.
