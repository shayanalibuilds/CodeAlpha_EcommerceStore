import 'dotenv/config';
import { connectDB, closeDB } from '../config/db.js';

// Minimal placeholder entry so the scaffold commit can boot.
// Real routes are wired in slice 1 (feat/auth-and-users).
const PORT = process.env.PORT || 5000;

async function main() {
  await connectDB();
  console.log('[server] bootstrapping Northwind Market backend on port', PORT);
  // Graceful shutdown helper for dev
  process.on('SIGINT', async () => {
    await closeDB();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('[server] fatal', err);
  process.exit(1);
});
