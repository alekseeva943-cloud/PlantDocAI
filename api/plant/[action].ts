/**
 * Vercel Vite + Functions entrypoint.
 * Reuses the actual Express router rather than duplicating model logic.
 * Each /api/plant/:action request is mapped to this function by Vercel.
 */
import express from 'express';
import plantRoutes from '../../server/api/plant.routes.js';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '48kb' }));

// Basic per-instance throttle is defense in depth, NOT a distributed
// quota. Configure OpenAI billing caps / Vercel Firewall for public traffic.
const requests = new Map<string, { count: number; reset: number }>();
app.use('/api/plant', (req, res, next) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_openai_api_key_here')) {
    return res.status(503).json({ error: 'AI-функции временно недоступны.' });
  }

  const raw = req.headers['x-vercel-forwarded-for'] || req.ip || 'unknown';
  const ip = (Array.isArray(raw) ? raw[0] : raw).toString().split(',')[0].slice(0, 90);
  const now = Date.now();
  const previous = requests.get(ip);
  const record = previous && previous.reset > now ? previous : { count: 0, reset: now + 60_000 };
  record.count += 1;
  requests.set(ip, record);
  if (requests.size > 5000) requests.clear();
  if (record.count > 8) {
    res.setHeader('Retry-After', Math.ceil((record.reset - now) / 1000).toString());
    return res.status(429).json({ error: 'Слишком много запросов. Попробуйте позже.' });
  }
  next();
});
app.use('/api/plant', plantRoutes);
export default app;
