import 'dotenv/config';
import app from './app.js';
import { connectDB, closeDB } from './config/db.js';

const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/northwind_market';

async function main() {
  await connectDB(MONGO_URI);
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`[server] Northwind Market API listening on http://127.0.0.1:${PORT}`);
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
