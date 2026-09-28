// Shared test bootstrap: in-memory MongoDB, supertest client, user factories.
// Every suite gets a throwaway database — no local mongod required.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.MONGOMS_VERSION = process.env.MONGOMS_VERSION || '7.0.14';

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import app from '../src/app.js';

let mem = null;

export async function startDb() {
  if (mongoose.connection.readyState === 0) {
    mem = await MongoMemoryServer.create({ instance: { port: 0 } });
    await mongoose.connect(mem.getUri('northwind_test'));
  }
}

export async function stopDb() {
  await mongoose.disconnect();
  if (mem) {
    await mem.stop();
    mem = null;
  }
}

export async function clearDb() {
  const { connection } = mongoose;
  await Promise.all(Object.values(connection.collections).map((c) => c.deleteMany({})));
}

export const api = () => request(app);

export function registerUser(overrides = {}) {
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return api()
    .post('/api/auth/register')
    .send({
      name: 'Test Customer',
      email: `customer-${stamp}@example.com`,
      password: 'password-customer-12',
      ...overrides,
    });
}

export async function createCustomer(overrides = {}) {
  const res = await registerUser(overrides);
  if (res.status !== 201) {
    throw new Error(`createCustomer failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body; // { token, user }
}

// Admins are seed-only in the product; tests insert one directly.
export async function createAdmin(overrides = {}) {
  const { default: User } = await import('../src/models/User.js');
  const { hashPassword } = await import('../src/utils/password.js');
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const user = await User.create({
    name: 'Test Admin',
    email: `admin-${stamp}@example.com`,
    passwordHash: await hashPassword('password-admin-12'),
    role: 'admin',
    ...overrides,
  });
  const res = await api()
    .post('/api/auth/login')
    .send({ email: user.email, password: 'password-admin-12' });
  if (res.status !== 200) {
    throw new Error(`createAdmin login failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body; // { token, user }
}
