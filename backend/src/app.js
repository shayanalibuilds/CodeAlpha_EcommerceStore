import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import { HttpError } from './utils/httpError.js';

const app = express();

// Allow-listed origins from CLIENT_ORIGIN (comma-separated). Reflect origin when unset (tests/dev).
const origins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(cors(origins.length ? { origin: origins } : {}));

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, name: 'Northwind Market API', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Unknown API routes → JSON 404.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});

// Central error handler — HttpErrors keep their status + field messages.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must be valid JSON.' });
  }
  if (err instanceof HttpError || (err && typeof err.status === 'number' && err.status >= 400 && err.status < 600)) {
    const body = { error: err.message || 'Request failed.' };
    if (err.fields) body.fields = err.fields;
    return res.status(err.status).json(body);
  }
  console.error('[error]', err);
  return res.status(500).json({ error: 'Something went wrong on our side. Try again.' });
});

export default app;
