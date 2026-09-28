import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { startDb, stopDb, clearDb, api, createAdmin, createCustomer } from './helpers.js';
import Product from '../src/models/Product.js';

let admin;
let alice; // buyer A
let bob;   // buyer B

async function seedProducts() {
  await Product.insertMany([
    {
      title: 'Gel Pen Rainbow Set',
      slug: 'gel-pen-rainbow-set',
      description: 'Twelve smooth gel pens in every color of the rainbow.',
      priceCents: 599,
      category: 'stationery',
      stock: 10,
    },
    {
      title: 'Sprout Everyday Backpack',
      slug: 'sprout-everyday-backpack',
      description: 'A fern-green backpack with a padded laptop sleeve.',
      priceCents: 3499,
      category: 'bags',
      stock: 2,
    },
    {
      title: 'Pastel Sticky Notes',
      slug: 'pastel-sticky-notes',
      description: 'Five pads of pastel sticky notes that peel cleanly.',
      priceCents: 449,
      category: 'stationery',
      stock: 25,
    },
  ]);
  return Product.find({}).lean();
}

const ADDRESS = {
  fullName: 'Alice Buyer',
  phone: '0300 1234567',
  line1: '12 Campus Road, Block A',
  city: 'Karachi',
  postalCode: '75500',
  country: 'Pakistan',
};

async function addToCart(token, productId, qty) {
  const res = await api()
    .post('/api/cart/items')
    .set('Authorization', `Bearer ${token}`)
    .send({ productId, qty });
  if (res.status !== 201) throw new Error(`addToCart failed: ${JSON.stringify(res.body)}`);
}

async function stockOf(slug) {
  const p = await Product.findOne({ slug }).lean();
  return p.stock;
}

beforeAll(async () => {
  await startDb();
});
afterAll(stopDb);
beforeEach(async () => {
  await clearDb();
  await seedProducts();
  admin = await createAdmin();
  alice = await createCustomer({ name: 'Alice Buyer', email: 'alice@example.com' });
  bob = await createCustomer({ name: 'Bob Neighbor', email: 'bob@example.com' });
});

describe('POST /api/orders (checkout)', () => {
  it('requires sign-in', async () => {
    const res = await api().post('/api/orders').send({ address: ADDRESS, paymentMethod: 'card' });
    expect(res.status).toBe(401);
  });

  it('rejects an empty cart with guidance', async () => {
    const res = await api()
      .post('/api/orders')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ address: ADDRESS, paymentMethod: 'card' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/cart is empty/i);
  });

  it('decrements stock, prices from the DB, empties the cart, defaults status to placed', async () => {
    const pen = (await Product.findOne({ slug: 'gel-pen-rainbow-set' }).lean())._id.toString();
    await addToCart(alice.token, pen, 3);

    const res = await api()
      .post('/api/orders')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ address: ADDRESS, paymentMethod: 'upi' });

    expect(res.status).toBe(201);
    expect(res.body.order.status).toBe('placed');
    expect(res.body.order.totalCents).toBe(599 * 3); // price from the Product doc
    expect(res.body.order.items[0]).toMatchObject({ title: 'Gel Pen Rainbow Set', qty: 3, priceCents: 599 });
    expect(res.body.order.address.fullName).toBe('Alice Buyer');

    expect(await stockOf('gel-pen-rainbow-set')).toBe(7);

    const cart = await api().get('/api/cart').set('Authorization', `Bearer ${alice.token}`);
    expect(cart.body.cart.count).toBe(0);
  });

  it('re-prices at checkout when the admin changed the price after add-to-cart', async () => {
    const pen = (await Product.findOne({ slug: 'gel-pen-rainbow-set' }).lean())._id.toString();
    await addToCart(alice.token, pen, 2);

    await api()
      .patch(`/api/products/${pen}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ priceCents: 799 });

    const res = await api()
      .post('/api/orders')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ address: ADDRESS, paymentMethod: 'card' });

    expect(res.status).toBe(201);
    expect(res.body.order.totalCents).toBe(799 * 2); // not 599*2
  });

  it('rejects oversell with 409 and leaves ALL stock untouched (compensation)', async () => {
    const pen = (await Product.findOne({ slug: 'gel-pen-rainbow-set' }).lean())._id.toString();
    const bag = (await Product.findOne({ slug: 'sprout-everyday-backpack' }).lean())._id.toString();
    await addToCart(alice.token, pen, 2);   // fine (stock 10)
    await addToCart(alice.token, bag, 2);   // fine in cart (stock 2)

    const res = await api()
      .post('/api/orders')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ address: ADDRESS, paymentMethod: 'cash' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/Sprout Everyday Backpack/);
    // Neither product may be decremented — pens must be restored to 10.
    expect(await stockOf('gel-pen-rainbow-set')).toBe(10);
    expect(await stockOf('sprout-everyday-backpack')).toBe(2);
  });

  it('validates address fields with how-to-fix messages', async () => {
    const pen = (await Product.findOne({ slug: 'gel-pen-rainbow-set' }).lean())._id.toString();
    await addToCart(alice.token, pen, 1);

    const res = await api()
      .post('/api/orders')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({
        address: { fullName: '', phone: '123', line1: 'x', city: '', postalCode: '1', country: '' },
        paymentMethod: 'card',
      });

    expect(res.status).toBe(400);
    expect(res.body.fields['address.fullName']).toBeTruthy();
    expect(res.body.fields['address.phone']).toBeTruthy();
    expect(res.body.fields['address.line1']).toBeTruthy();
  });

  it('rejects unknown payment methods', async () => {
    const pen = (await Product.findOne({ slug: 'gel-pen-rainbow-set' }).lean())._id.toString();
    await addToCart(alice.token, pen, 1);

    const res = await api()
      .post('/api/orders')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ address: ADDRESS, paymentMethod: 'crypto' });

    expect(res.status).toBe(400);
    expect(res.body.fields.paymentMethod).toBeTruthy();
  });
});

describe('GET /api/orders and /api/orders/:id (isolation)', () => {
  it("foreign orders 404 — Bob cannot read Alice's receipt", async () => {
    const pen = (await Product.findOne({ slug: 'gel-pen-rainbow-set' }).lean())._id.toString();
    await addToCart(alice.token, pen, 1);
    const created = await api()
      .post('/api/orders')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ address: ADDRESS, paymentMethod: 'card' });
    const orderId = created.body.order.id;

    const foreign = await api().get(`/api/orders/${orderId}`).set('Authorization', `Bearer ${bob.token}`);
    expect(foreign.status).toBe(404);

    const mine = await api().get(`/api/orders/${orderId}`).set('Authorization', `Bearer ${alice.token}`);
    expect(mine.status).toBe(200);

    const adminView = await api().get(`/api/orders/${orderId}`).set('Authorization', `Bearer ${admin.token}`);
    expect(adminView.status).toBe(200);
  });

  it('lists only own orders for customers; admins can list all with scope=all', async () => {
    const pen = (await Product.findOne({ slug: 'gel-pen-rainbow-set' }).lean())._id.toString();
    await addToCart(alice.token, pen, 1);
    await api().post('/api/orders').set('Authorization', `Bearer ${alice.token}`).send({ address: ADDRESS, paymentMethod: 'card' });

    const aliceList = await api().get('/api/orders').set('Authorization', `Bearer ${alice.token}`);
    expect(aliceList.body.orders).toHaveLength(1);

    const bobList = await api().get('/api/orders').set('Authorization', `Bearer ${bob.token}`);
    expect(bobList.body.orders).toHaveLength(0);

    const bobScopeAll = await api().get('/api/orders?scope=all').set('Authorization', `Bearer ${bob.token}`);
    expect(bobScopeAll.body.orders).toHaveLength(0); // scope=all is admin-only

    const adminList = await api().get('/api/orders?scope=all').set('Authorization', `Bearer ${admin.token}`);
    expect(adminList.body.orders).toHaveLength(1);
    expect(adminList.body.orders[0].user.email).toBe('alice@example.com');
  });
});

describe('PATCH /api/orders/:id/status (admin)', () => {
  async function placeOrder() {
    const pen = (await Product.findOne({ slug: 'gel-pen-rainbow-set' }).lean())._id.toString();
    await addToCart(alice.token, pen, 2);
    const res = await api()
      .post('/api/orders')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ address: ADDRESS, paymentMethod: 'card' });
    return res.body.order.id;
  }

  it('is admin-only', async () => {
    const orderId = await placeOrder();
    const res = await api()
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ status: 'packed' });
    expect(res.status).toBe(403);
  });

  it('walks placed → packed → shipped', async () => {
    const orderId = await placeOrder();

    const packed = await api()
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'packed' });
    expect(packed.body.order.status).toBe('packed');

    const shipped = await api()
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'shipped' });
    expect(shipped.body.order.status).toBe('shipped');
  });

  it('rejects invalid transitions', async () => {
    const orderId = await placeOrder();

    const skip = await api()
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'shipped' });
    expect(skip.status).toBe(400);
    expect(skip.body.fields.status).toBeTruthy();
  });

  it('restocks when an order is cancelled', async () => {
    const orderId = await placeOrder();
    expect(await stockOf('gel-pen-rainbow-set')).toBe(8);

    const res = await api()
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'cancelled' });

    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe('cancelled');
    expect(await stockOf('gel-pen-rainbow-set')).toBe(10);
  });

  it('refuses to change a cancelled order', async () => {
    const orderId = await placeOrder();
    await api().patch(`/api/orders/${orderId}/status`).set('Authorization', `Bearer ${admin.token}`).send({ status: 'cancelled' });

    const res = await api()
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'packed' });

    expect(res.status).toBe(400);
  });
});
