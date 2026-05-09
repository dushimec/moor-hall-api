import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import app from '../src/server';

// Create HTTP server from Express app
const server = createServer(app);

// Vercel serverless function handler
export default function handler(req: IncomingMessage, res: ServerResponse) {
  // Parse the URL
  const parsedUrl = parse(req.url || '/', true);
  
  // Emit request to the Express server
  server.emit('request', req, res);
}

// Handle warm-up requests (optional, for performance)
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - /api-docs (Swagger UI - static assets)
     * - /_next (Next.js internals)
     * - /_vercel (Vercel internals)
     * - /favicon.ico (favicon)
     * - *.svg, *.png, *.jpg, *.ico (static assets)
     */
    '/((?!api-docs|_next|_vercel|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico)$).*)',
  ],
};
