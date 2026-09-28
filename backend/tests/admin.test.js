import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { startDb, stopDb, clearDb, api, createAdmin, createCustomer } from './helpers.js';
import Product from '../src/models/Product.js';

let admin;
let customer;

async function seedOneProduct() {
  const p = await Product.create({
    title: 'Glow Study Desk Lamp',
    slug: 'glow-study-desk-lamp',
    description: 'A warm-white lamp with three brightness levels and a phone stand.',
    priceCents: 2499,
    category: 'desk',
    stock: 7,
  });
  return p;
}

beforeAll(startDb);
afterAll(stopDb);
beforeEach(async () => {
  await clearDb();
  admin = await createAdmin();
  customer = await createCustomer();
});

describe('admin product edge cases', () => {
  it('PATCHes a single field without touching the rest', async () => {
    const p = await seedOneProduct();
    const res = await api()
      .patch(`/api/products/${p._id}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ stock: 3 });

    expect(res.status).toBe(200);
    expect(res.body.product.stock).toBe(3);
    expect(res.body.product.priceCents).toBe(2499); // unchanged
    expect(res.body.product.title).toBe('Glow Study Desk Lamp'); // unchanged, slug stable
    expect(res.body.product.slug).toBe('glow-study-desk-lamp');
  });

  it('404s when patching an unknown product id', async () => {
    const res = await api()
      .patch(`/api/products/${'c'.repeat(24)}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ stock: 1 });
    expect(res.status).toBe(404);
  });

  it('archives and later restores a product', async () => {
    const p = await seedOneProduct();

    const archived = await api()
      .patch(`/api/products/${p._id}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ archived: true });
    expect(archived.body.product.archived).toBe(true);
    expect((await api().get(`/api/products/${p._id}`)).status).toBe(404);

    const restored = await api()
      .patch(`/api/products/${p._id}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ archived: false });
    expect(restored.body.product.archived).toBe(false);
    expect((await api().get(`/api/products/${p._id}`)).status).toBe(200);
  });
});

describe('admin order listing scope', () => {
  it('admin without scope=all sees only their own orders; with scope=all sees everyone', async () => {
    const p = await seedOneProduct();

    // customer places an order
    await api()
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ productId: p._id.toString(), qty: 1 });
    await api()
      .post('/api/orders')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        address: {
          fullName: 'Cust Omer', phone: '0300 1234567', line1: '12 Campus Road',
          city: 'Karachi', postalCode: '75500', country: 'Pakistan',
        },
        paymentMethod: 'card',
      });

    const own = await api().get('/api/orders').set('Authorization', `Bearer ${admin.token}`);
    expect(own.body.orders).toHaveLength(0);

    const all = await api().get('/api/orders?scope=all').set('Authorization', `Bearer ${admin.token}`);
    expect(all.body.orders).toHaveLength(1);
    expect(all.body.orders[0].user.email).toBe(customer.user.email);
  });
});
