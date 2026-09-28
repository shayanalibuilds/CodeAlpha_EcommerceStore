import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { startDb, stopDb, clearDb, api, createCustomer } from './helpers.js';
import Product from '../src/models/Product.js';

async function seedProducts() {
  await Product.insertMany([
    {
      title: 'Gel Pen Rainbow Set',
      slug: 'gel-pen-rainbow-set',
      description: 'Twelve smooth gel pens in every color of the rainbow.',
      priceCents: 599,
      category: 'stationery',
      stock: 5,
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
      stock: 0, // out of stock on purpose
    },
  ]);
  return Product.find({}).lean();
}

async function authed(token) {
  return api().set('Authorization', `Bearer ${token}`);
}

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

describe('cart auth isolation', () => {
  it('rejects every cart route without a token', async () => {
    expect((await api().get('/api/cart')).status).toBe(401);
    expect((await api().post('/api/cart/items').send({ productId: 'a'.repeat(24) })).status).toBe(401);
    expect((await api().patch(`/api/cart/items/${'a'.repeat(24)}`).send({ qty: 1 })).status).toBe(401);
    expect((await api().delete(`/api/cart/items/${'a'.repeat(24)}`)).status).toBe(401);
  });
});

describe('POST /api/cart/items', () => {
  it('adds an item and reports count + subtotal', async () => {
    const { token } = await createCustomer();
    const products = await seedProducts();
    const pen = products.find((p) => p.slug === 'gel-pen-rainbow-set');

    const res = await authed(token).post('/api/cart/items').send({ productId: pen._id.toString(), qty: 2 });

    expect(res.status).toBe(201);
    expect(res.body.cart.count).toBe(2);
    expect(res.body.cart.subtotalCents).toBe(599 * 2);
    expect(res.body.cart.items[0].title).toBe('Gel Pen Rainbow Set');
    expect(res.body.cart.items[0].priceCents).toBe(599);
  });

  it('merges repeated adds of the same product', async () => {
    const { token } = await createCustomer();
    const products = await seedProducts();
    const pen = products.find((p) => p.slug === 'gel-pen-rainbow-set')._id.toString();

    await authed(token).post('/api/cart/items').send({ productId: pen, qty: 1 });
    const res = await authed(token).post('/api/cart/items').send({ productId: pen, qty: 2 });

    expect(res.body.cart.count).toBe(3);
    expect(res.body.cart.items).toHaveLength(1);
  });

  it('rejects quantities beyond stock with a 409 field error', async () => {
    const { token } = await createCustomer();
    const products = await seedProducts();
    const bag = products.find((p) => p.slug === 'sprout-everyday-backpack')._id.toString();

    const res = await authed(token).post('/api/cart/items').send({ productId: bag, qty: 3 });

    expect(res.status).toBe(409);
    expect(res.body.fields.qty).toMatch(/Only 2 left/);
  });

  it('refuses out-of-stock products with 409', async () => {
    const { token } = await createCustomer();
    const products = await seedProducts();
    const notes = products.find((p) => p.slug === 'pastel-sticky-notes')._id.toString();

    const res = await authed(token).post('/api/cart/items').send({ productId: notes, qty: 1 });
    expect(res.status).toBe(409);
    expect(res.body.fields.qty).toMatch(/out of stock/i);
  });

  it('validates qty and product id', async () => {
    const { token } = await createCustomer();
    const products = await seedProducts();
    const pen = products.find((p) => p.slug === 'gel-pen-rainbow-set')._id.toString();

    const zero = await authed(token).post('/api/cart/items').send({ productId: pen, qty: 0 });
    expect(zero.status).toBe(400);
    expect(zero.body.fields.qty).toMatch(/at least 1/);

    const bad = await authed(token).post('/api/cart/items').send({ productId: 'not-an-id' });
    expect(bad.status).toBe(400);
    expect(bad.body.fields.productId).toBeTruthy();

    const missing = await authed(token).post('/api/cart/items').send({ productId: 'a'.repeat(24) });
    expect(missing.status).toBe(404);
  });
});

describe('PATCH /api/cart/items/:productId', () => {
  it('updates the quantity', async () => {
    const { token } = await createCustomer();
    const products = await seedProducts();
    const pen = products.find((p) => p.slug === 'gel-pen-rainbow-set')._id.toString();
    await authed(token).post('/api/cart/items').send({ productId: pen, qty: 1 });

    const res = await authed(token).patch(`/api/cart/items/${pen}`).send({ qty: 4 });
    expect(res.status).toBe(200);
    expect(res.body.cart.count).toBe(4);
  });

  it('caps the quantity at available stock with 409', async () => {
    const { token } = await createCustomer();
    const products = await seedProducts();
    const pen = products.find((p) => p.slug === 'gel-pen-rainbow-set')._id.toString();
    await authed(token).post('/api/cart/items').send({ productId: pen, qty: 1 });

    const res = await authed(token).patch(`/api/cart/items/${pen}`).send({ qty: 6 });
    expect(res.status).toBe(409);
    expect(res.body.fields.qty).toMatch(/Only 5 left/);
  });

  it('404s for products not in the cart', async () => {
    const { token } = await createCustomer();
    await seedProducts();
    const res = await authed(token).patch(`/api/cart/items/${'b'.repeat(24)}`).send({ qty: 1 });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/cart/items/:productId', () => {
  it('removes an item', async () => {
    const { token } = await createCustomer();
    const products = await seedProducts();
    const pen = products.find((p) => p.slug === 'gel-pen-rainbow-set')._id.toString();
    await authed(token).post('/api/cart/items').send({ productId: pen, qty: 2 });

    const res = await authed(token).delete(`/api/cart/items/${pen}`);
    expect(res.status).toBe(200);
    expect(res.body.cart.count).toBe(0);
    expect(res.body.cart.subtotalCents).toBe(0);
  });
});

describe('cart persistence per user', () => {
  it('keeps different carts for different users', async () => {
    const a = await createCustomer();
    const b = await createCustomer();
    const products = await seedProducts();
    const pen = products.find((p) => p.slug === 'gel-pen-rainbow-set')._id.toString();

    await authed(a.token).post('/api/cart/items').send({ productId: pen, qty: 2 });

    const bCart = await authed(b.token).get('/api/cart');
    expect(bCart.body.cart.count).toBe(0);

    const aCart = await authed(a.token).get('/api/cart');
    expect(aCart.body.cart.count).toBe(2);
  });
});
