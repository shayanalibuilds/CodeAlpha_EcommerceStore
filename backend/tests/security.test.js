// Security regression tests (audit issue #8).
//   - No JWT_SECRET: signing/verifying must throw, not fall back to a public
//     string (the server also refuses to boot — see src/server.js).
//   - Algorithm is pinned to HS256; "none" / wrong-secret tokens are dead.
//   - Authorization reflects the DATABASE: a forged token with an unknown sub,
//     a demoted admin, or a deleted account gets no access.
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { startDb, stopDb, clearDb, api, createAdmin, createCustomer } from './helpers.js';
import Product from '../src/models/Product.js';
import User from '../src/models/User.js';
import { signToken, verifyToken } from '../src/utils/jwt.js';

const PRODUCT_BODY = {
  title: 'Probe Pencil',
  description: 'A pencil used to probe admin rights.',
  priceCents: 199,
  category: 'stationery',
  stock: 5,
};

beforeAll(startDb);
afterAll(stopDb);

describe('JWT secret hardening (#8)', () => {
  it('refuses to sign or verify when JWT_SECRET is missing', () => {
    const prev = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    try {
      expect(() => signToken({ _id: new mongoose.Types.ObjectId(), role: 'admin' })).toThrow(
        /JWT_SECRET/
      );
      expect(() => verifyToken('whatever.token.here')).toThrow(/JWT_SECRET/);
    } finally {
      process.env.JWT_SECRET = prev;
    }
  });

  it('pins HS256 — "none"-algorithm and wrong-secret tokens are rejected', () => {
    const none = jwt.sign({ sub: 'x', role: 'admin' }, 'ignored', { algorithm: 'none' });
    expect(() => verifyToken(none)).toThrow();

    const otherSecret = jwt.sign({ sub: 'x', role: 'admin' }, 'not-the-app-secret');
    expect(() => verifyToken(otherSecret)).toThrow();
  });
});

describe('authorization reflects the database (#8)', () => {
  beforeEach(clearDb);

  it('a forged admin token with an unknown sub gets no admin power', async () => {
    // Signed with the real secret, but the user does not exist.
    const forged = jwt.sign(
      { sub: new mongoose.Types.ObjectId().toString(), role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const created = await api()
      .post('/api/products')
      .set('Authorization', `Bearer ${forged}`)
      .send(PRODUCT_BODY);
    expect(created.status).toBe(401);

    // The old leak: scope=all dumped every customer's orders.
    const scoped = await api()
      .get('/api/orders?scope=all')
      .set('Authorization', `Bearer ${forged}`);
    expect(scoped.status).toBe(401);
  });

  it('a demoted admin loses admin powers immediately', async () => {
    const admin = await createAdmin();

    const ok = await api()
      .post('/api/products')
      .set('Authorization', `Bearer ${admin.token}`)
      .send(PRODUCT_BODY);
    expect(ok.status).toBe(201);

    await User.updateOne({ email: admin.user.email }, { $set: { role: 'customer' } });

    const again = await api()
      .post('/api/products')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ ...PRODUCT_BODY, title: 'Probe Pencil 2' });
    expect(again.status).toBe(403);

    // scope=all is no longer honored: the request only ever sees own orders.
    const list = await api()
      .get('/api/orders?scope=all')
      .set('Authorization', `Bearer ${admin.token}`);
    expect(list.status).toBe(200);
    expect(list.body.orders).toHaveLength(0);
  });

  it("a deleted account's token stops working", async () => {
    const customer = await createCustomer();

    await User.deleteOne({ email: customer.user.email });

    const res = await api().get('/api/cart').set('Authorization', `Bearer ${customer.token}`);
    expect(res.status).toBe(401);
  });
});
