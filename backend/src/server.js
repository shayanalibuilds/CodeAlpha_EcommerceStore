import 'dotenv/config';
import app from './app.js';
import { connectDB, closeDB } from './config/db.js';

// Fail fast: without a strong secret, anyone who reads this repo could forge
// admin tokens. Refuse to boot rather than start in an insecure state.
if (!process.env.JWT_SECRET) {
  console.error(
    '[server] JWT_SECRET is not set. Copy backend/.env.example to backend/.env, set a strong secret, and restart.'
  );
  process.exit(1);
}

const PORT = Number(process.env.PORT || 5001);
// Bind to all interfaces by default so deployments (Docker/PaaS) can reach
// the API; set HOST=127.0.0.1 for loopback-only local development.
const HOST = process.env.HOST || '0.0.0.0';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/northwind_market';

async function main() {
  await connectDB(MONGO_URI);
  app.listen(PORT, HOST, () => {
    console.log(`[server] Northwind Market API listening on http://${HOST}:${PORT}`);
  });
  process.on('SIGINT', async () => {
    await closeDB();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('[server] fatal', err);
  process.exit(1);
});
