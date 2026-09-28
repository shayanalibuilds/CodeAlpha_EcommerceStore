// Embedded demo MongoDB on 127.0.0.1:27017 — for quick demos when no local
// mongod or Atlas cluster is available. Real deployments should use a real
// MongoDB (local service or Atlas); the URI still lives in backend/.env only.
process.env.MONGOMS_VERSION = process.env.MONGOMS_VERSION || '7.0.14';

import { MongoMemoryServer } from 'mongodb-memory-server';

const mem = await MongoMemoryServer.create({
  instance: { port: 27017, ip: '127.0.0.1', dbName: 'northwind_market' },
});

console.log('[dev-mongo] embedded MongoDB ready at', mem.getUri());
console.log('[dev-mongo] press Ctrl+C to stop');

process.on('SIGINT', async () => {
  await mem.stop();
  process.exit(0);
});

// Keep the process alive.
setInterval(() => {}, 1 << 30);
