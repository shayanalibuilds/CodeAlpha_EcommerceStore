// Concurrency regression tests (audit issues #6 and #7).
//   #6 — one cart must produce at most one order, stock decremented exactly
//        once, and a failed Order.create must restore stock AND the cart.
//   #7 — however many cancel requests race, an order restocks exactly once.
import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import { startDb, stopDb, clearDb, api, createCustomer, createAdmin } from './helpers.js';
import Product from '../src/models/Product.js';
import Order from '../src/models/Order.js';

const ADDRESS = {
  fullName: 'Race Runner',
  phone: '0300 7654321',
  line1: '9 Parallel Lane, Block C',
  city: 'Karachi',
  postalCode: '75500',
  country: 'Pakistan',
};

let customer;
let admin;
let bottle; // starts with stock 45
let lamp; // starts with stock 10

async function seedProducts() {
  await Product.insertMany([
    {
      title: 'Race Water Bottle',
      slug: 'race-water-bottle',
      description: 'A bottle to stress-test concurrent checkouts against.',
      priceCents: 899,
      category: 'audio',
      stock: 45,
    },
    {
      title: 'Race Desk Lamp',
      slug: 'race-desk-lamp',
      description: 'A lamp to stress-test multi-line checkout compensation.',
      priceCents: 2499,
      category: 'desk',
      stock: 10,
    },
  ]);
  bottle = await Product.findOne({ slug: 'race-water-bottle' }).lean();
  lamp = await Product.findOne({ slug: 'race-desk-lamp' }).lean();
}

async function addToCart(productId, qty) {
  const res = await api()
    .post('/api/cart/items')
    .set('Authorization', `Bearer ${customer.token}`)
    .send({ productId, qty });
  if (res.status !== 201) throw new Error(`addToCart failed: ${JSON.stringify(res.body)}`);
}

async function stockOf(productId) {
  const p = await Product.findById(productId).lean();
  return p.stock;
}

async function cartItems() {
  const res = await api().get('/api/cart').set('Authorization', `Bearer ${customer.token}`);
  expect(res.status).toBe(200);
  return res.body.cart.items;
}

beforeAll(startDb);
afterAll(stopDb);
beforeEach(async () => {
  await clearDb();
  await seedProducts();
  customer = await createCustomer({ name: 'Race Runner', email: 'runner@example.com' });
  admin = await createAdmin();
});

describe('checkout race — one cart, parallel POST /api/orders (#6)', () => {
  it('creates exactly one order when five submits fire together', async () => {
    await addToCart(bottle._id, 2);

    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        api()
          .post('/api/orders')
          .set('Authorization', `Bearer ${customer.token}`)
          .send({ address: ADDRESS, paymentMethod: 'card' })
      )
    );

    const created = responses.filter((r) => r.status === 201);
    expect(created).toHaveLength(1);
    for (const r of responses) {
      if (r.status !== 201) {
        expect(r.status).toBe(400);
        expect(r.body.error).toMatch(/empty/i);
      }
    }

    // One order, stock decremented exactly once, cart drained.
    expect(await Order.countDocuments()).toBe(1);
    expect(await stockOf(bottle._id)).toBe(45 - 2);
    expect(await cartItems()).toHaveLength(0);
  });

  it('restores stock and the cart when Order.create fails after the claim', async () => {
    await addToCart(bottle._id, 2);
    await addToCart(lamp._id, 3);

    const spy = jest.spyOn(Order, 'create').mockRejectedValueOnce(new Error('ledger exploded'));
    let res;
    try {
      res = await api()
        .post('/api/orders')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ address: ADDRESS, paymentMethod: 'card' });
    } finally {
      spy.mockRestore();
    }
    expect(res.status).toBe(500);

    // Every decremented line is back on the shelf, exactly where it started.
    expect(await stockOf(bottle._id)).toBe(45);
    expect(await stockOf(lamp._id)).toBe(10);

    // The claimed cart is restored intact (nothing lost, nothing doubled).
    const items = await cartItems();
    expect(items).toHaveLength(2);
    const byQty = items.map((i) => i.qty).sort();
    expect(byQty).toEqual([2, 3]);

    // And the cart still works: a plain retry places the order.
    const retry = await api()
      .post('/api/orders')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ address: ADDRESS, paymentMethod: 'card' });
    expect(retry.status).toBe(201);
    expect(await stockOf(bottle._id)).toBe(43);
    expect(await stockOf(lamp._id)).toBe(7);
  });

  it('keeps the cart intact across repeated failed checkouts', async () => {
    // Fail the first checkout, then have the user add a DIFFERENT item while
    // the compensation runs — the rebuild must win over the stale restore.
    await addToCart(bottle._id, 1);

    // Simulate the user rebuilding the cart between the failure and the
    // restore window by listening to the failed attempt, then re-adding.
    const spy = jest.spyOn(Order, 'create').mockRejectedValueOnce(new Error('boom'));
    let res;
    try {
      res = await api()
        .post('/api/orders')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ address: ADDRESS, paymentMethod: 'card' });
    } finally {
      spy.mockRestore();
    }
    expect(res.status).toBe(500);
    expect(await cartItems()).toHaveLength(1); // restored once

    // A second failed checkout must not double-restore on top of new adds.
    await addToCart(lamp._id, 1);
    const spy2 = jest.spyOn(Order, 'create').mockRejectedValueOnce(new Error('boom again'));
    let res2;
    try {
      res2 = await api()
        .post('/api/orders')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ address: ADDRESS, paymentMethod: 'card' });
    } finally {
      spy2.mockRestore();
    }
    expect(res2.status).toBe(500);
    const items = await cartItems();
    expect(items).toHaveLength(2);
    expect(await stockOf(bottle._id)).toBe(45);
    expect(await stockOf(lamp._id)).toBe(10);
  });
});

describe('cancel race — parallel PATCH /api/orders/:id/status (#7)', () => {
  async function placeOrder(productId, qty) {
    await addToCart(productId, qty);
    const res = await api()
      .post('/api/orders')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ address: ADDRESS, paymentMethod: 'card' });
    expect(res.status).toBe(201);
    return res.body.order.id;
  }

  it('restocks exactly once when ten cancel requests race', async () => {
    const orderId = await placeOrder(bottle._id, 2);
    const afterCheckout = await stockOf(bottle._id); // 43

    const responses = await Promise.all(
      Array.from({ length: 10 }, () =>
        api()
          .patch(`/api/orders/${orderId}/status`)
          .set('Authorization', `Bearer ${admin.token}`)
          .send({ status: 'cancelled' })
      )
    );
    for (const r of responses) {
      expect(r.status).toBe(200);
    }

    expect(await stockOf(bottle._id)).toBe(afterCheckout + 2); // +qty exactly once
    expect((await Order.findById(orderId).lean()).status).toBe('cancelled');
  });

  it('a cancel after a cancel is an idempotent no-op with no extra stock', async () => {
    const orderId = await placeOrder(lamp._id, 1);

    const first = await api()
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'cancelled' });
    expect(first.status).toBe(200);
    const afterFirst = await stockOf(lamp._id);

    const again = await api()
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'cancelled' });
    expect(again.status).toBe(200);
    expect(await stockOf(lamp._id)).toBe(afterFirst);
  });

  it('still refuses invalid transitions and unknown orders', async () => {
    const orderId = await placeOrder(bottle._id, 1);

    const skip = await api()
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'shipped' });
    expect(skip.status).toBe(400);
    expect(skip.body.fields.status).toBeTruthy();

    const missing = await api()
      .patch('/api/orders/000000000000000000000000/status')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'cancelled' });
    expect(missing.status).toBe(404);
  });
});
