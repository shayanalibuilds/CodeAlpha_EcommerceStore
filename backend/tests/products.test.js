import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { startDb, stopDb, clearDb, api, createAdmin, createCustomer } from './helpers.js';
import Product from '../src/models/Product.js';

// Deterministic catalog fixtures. Inserted oldest-first so "newest" sort is checkable.
const FIXTURES = [
  { title: 'Sunrise Spiral Notebook', slug: 'sunrise-spiral-notebook', description: 'A cheerful 3-pack of spiral notebooks with dotted pages.', priceCents: 749, category: 'stationery', stock: 40 },
  { title: 'Gel Pen Rainbow Set', slug: 'gel-pen-rainbow-set', description: 'Twelve smooth gel pens in every color of the rainbow.', priceCents: 599, category: 'stationery', stock: 60 },
  { title: 'Star Stories Night Sky Guide', slug: 'star-stories-night-sky-guide', description: 'A kid-friendly guide to constellations and night-sky stories.', priceCents: 1499, category: 'books', stock: 24 },
  { title: 'CloudSoft Over-Ear Headphones', slug: 'cloudsoft-over-ear-headphones', description: 'Cushioned headphones tuned for long study sessions.', priceCents: 2999, category: 'audio', stock: 12 },
  { title: 'Sprout Everyday Backpack', slug: 'sprout-everyday-backpack', description: 'A fern-green backpack with a padded 15-inch laptop sleeve.', priceCents: 3499, category: 'bags', stock: 15 },
];

async function seedProducts() {
  await Product.insertMany(FIXTURES.map((p) => ({ ...p, imageUrl: `/images/products/${p.slug}.svg` })));
}

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

describe('GET /api/products (public catalog)', () => {
  it('lists products with titles for guests', async () => {
    await seedProducts();
    const res = await api().get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(5);
    const titles = res.body.items.map((p) => p.title);
    expect(titles).toContain('Sunrise Spiral Notebook');
    expect(titles).toContain('CloudSoft Over-Ear Headphones');
  });

  it('searches by title/description text (q=)', async () => {
    await seedProducts();
    const res = await api().get('/api/products?q=headphones');

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.items[0].slug).toBe('cloudsoft-over-ear-headphones');
  });

  it('search is escaped: regex metacharacters match nothing and do not crash', async () => {
    await seedProducts();
    const res = await api().get('/api/products?q=.*');

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
  });

  it('filters by category and returns empty for unknown categories', async () => {
    await seedProducts();

    const bags = await api().get('/api/products?category=bags');
    expect(bags.body.count).toBe(1);
    expect(bags.body.items[0].slug).toBe('sprout-everyday-backpack');

    const unknown = await api().get('/api/products?category=toys');
    expect(unknown.status).toBe(200);
    expect(unknown.body.count).toBe(0);
  });

  it('sorts by price ascending with sort=price and newest-first by default', async () => {
    await seedProducts();

    const byPrice = await api().get('/api/products?sort=price');
    const prices = byPrice.body.items.map((p) => p.priceCents);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));

    const byNewest = await api().get('/api/products');
    expect(byNewest.body.items[0].slug).toBe('sprout-everyday-backpack'); // last inserted
  });

  it('hides archived products from the public list', async () => {
    await seedProducts();
    await Product.updateOne({ slug: 'gel-pen-rainbow-set' }, { archived: true });

    const res = await api().get('/api/products');
    expect(res.body.items.map((p) => p.slug)).not.toContain('gel-pen-rainbow-set');
  });
});

describe('GET /api/products/:id (public detail)', () => {
  it('finds a product by id and by slug', async () => {
    await seedProducts();
    const listed = await api().get('/api/products');
    const { id, slug } = listed.body.items[0];

    const byId = await api().get(`/api/products/${id}`);
    expect(byId.status).toBe(200);
    expect(byId.body.product.id).toBe(id);

    const bySlug = await api().get(`/api/products/${slug}`);
    expect(bySlug.status).toBe(200);
    expect(bySlug.body.product.slug).toBe(slug);
  });

  it('404s for unknown ids and malformed ids', async () => {
    await seedProducts();
    expect((await api().get('/api/products/nonexistent-slug')).status).toBe(404);
    expect((await api().get('/api/products/zzz-not-an-objectid')).status).toBe(404);
  });

  it('returns 404 for archived products to customers but lets admins view them', async () => {
    await seedProducts();
    await Product.updateOne({ slug: 'gel-pen-rainbow-set' }, { archived: true });
    const archived = await Product.findOne({ slug: 'gel-pen-rainbow-set' }).lean();
    const admin = await createAdmin();

    expect((await api().get(`/api/products/${archived._id}`)).status).toBe(404);
    expect((await api().get(`/api/products/${archived._id}`).set('Authorization', `Bearer ${admin.token}`)).status).toBe(200);
  });
});

describe('POST /api/products (admin only)', () => {
  it('rejects anonymous and customer requests', async () => {
    expect((await api().post('/api/products').send({})).status).toBe(401);

    const customer = await createCustomer();
    const res = await api().post('/api/products').set('Authorization', `Bearer ${customer.token}`).send({
      title: 'Nope', description: 'A customer should not be able to do this at all.', priceCents: 100, category: 'books', stock: 1,
    });
    expect(res.status).toBe(403);
  });

  it('lets an admin create a product with a generated unique slug', async () => {
    const admin = await createAdmin();
    const res = await api().post('/api/products').set('Authorization', `Bearer ${admin.token}`).send({
      title: 'Glow Study Desk Lamp', description: 'A warm-white lamp with three brightness levels.', priceCents: 2499, category: 'desk', stock: 10,
    });

    expect(res.status).toBe(201);
    expect(res.body.product.slug).toBe('glow-study-desk-lamp');
    expect(res.body.product.id).toBeTruthy();

    const again = await api().post('/api/products').set('Authorization', `Bearer ${admin.token}`).send({
      title: 'Glow Study Desk Lamp', description: 'A second lamp with the same title on purpose.', priceCents: 2199, category: 'desk', stock: 3,
    });
    expect(again.body.product.slug).toBe('glow-study-desk-lamp-2');
  });

  it('explains how to fix invalid fields', async () => {
    const admin = await createAdmin();
    const res = await api().post('/api/products').set('Authorization', `Bearer ${admin.token}`).send({
      title: 'No', description: 'Too short.', priceCents: 0, category: 'books', stock: -2,
    });

    expect(res.status).toBe(400);
    expect(res.body.fields.title).toMatch(/at least 3 characters/);
    expect(res.body.fields.description).toMatch(/at least 10 characters/);
    expect(res.body.fields.priceCents).toMatch(/at least 1 cent/);
    expect(res.body.fields.stock).toMatch(/negative/);
  });
});

describe('PATCH /api/products/:id (admin only)', () => {
  it('lets an admin edit price and stock', async () => {
    const admin = await createAdmin();
    await seedProducts();
    const listed = await api().get('/api/products');
    const target = listed.body.items.find((p) => p.slug === 'sunrise-spiral-notebook');

    const res = await api()
      .patch(`/api/products/${target.id}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ priceCents: 899, stock: 55 });

    expect(res.status).toBe(200);
    expect(res.body.product.priceCents).toBe(899);
    expect(res.body.product.stock).toBe(55);
  });

  it('blocks customers from editing', async () => {
    const customer = await createCustomer();
    await seedProducts();
    const listed = await api().get('/api/products');
    const target = listed.body.items[0];

    const res = await api()
      .patch(`/api/products/${target.id}`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({ priceCents: 1 });
    expect(res.status).toBe(403);
  });

  it('archives a product, which then 404s for customers and drops from the public list', async () => {
    const admin = await createAdmin();
    await seedProducts();
    const listed = await api().get('/api/products');
    const target = listed.body.items.find((p) => p.slug === 'gel-pen-rainbow-set');

    const res = await api()
      .patch(`/api/products/${target.id}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ archived: true });
    expect(res.status).toBe(200);
    expect(res.body.product.archived).toBe(true);

    expect((await api().get(`/api/products/${target.id}`)).status).toBe(404);
    const publicList = await api().get('/api/products');
    expect(publicList.body.items.map((p) => p.id)).not.toContain(target.id);

    const adminList = await api().get('/api/products?includeArchived=1').set('Authorization', `Bearer ${admin.token}`);
    expect(adminList.body.items.map((p) => p.id)).toContain(target.id);
  });
});
