import app from '../src/server';

// Vercel serverless function handler - wrap the Express app in a function
// so the platform receives a proper (req, res) handler and we avoid
// any ambiguity with module exports.
export default function handler(req: any, res: any) {
	return app(req, res);
}
