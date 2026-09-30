import Product, { CATEGORIES, toPublicProduct } from '../models/Product.js';
import { HttpError } from '../utils/httpError.js';
import { wrap } from '../utils/asyncHandler.js';
import { slugify, uniqueSlug } from '../utils/slug.js';

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const list = wrap(async (req, res) => {
  const { q, category, sort } = req.query;
  // includeArchived=1 is honored for admins only; everyone else sees live products.
  const includeArchived = req.query.includeArchived === '1' && req.user?.role === 'admin';

  // Catalog-wide total, ignoring search/category filters — the UI's
  // "All Pieces (N)" counter must always describe the whole shop, not the
  // currently filtered slice.
  const total = await Product.countDocuments(includeArchived ? {} : { archived: false });

  const filter = {};
  if (!includeArchived) filter.archived = false;

  if (category) {
    const cat = String(category).toLowerCase();
    if (!CATEGORIES.includes(cat)) {
      return res.json({ items: [], count: 0, total });
    }
    filter.category = cat;
  }

  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: rx }, { description: rx }];
  }

  const sortSpec = sort === 'price' ? { priceCents: 1, _id: 1 } : { createdAt: -1, _id: -1 };
  const items = await Product.find(filter).sort(sortSpec).limit(200).lean();

  res.json({ items: items.map(toPublicProduct), count: items.length, total });
});

export const getOne = wrap(async (req, res) => {
  const { id } = req.params;
  const query = OBJECT_ID.test(id) ? { _id: id } : { slug: id };
  const product = await Product.findOne(query).lean();

  if (!product || (product.archived && req.user?.role !== 'admin')) {
    throw new HttpError(404, 'Product not found.');
  }

  res.json({ product: toPublicProduct(product) });
});

export const create = wrap(async (req, res) => {
  const data = req.body; // validated by middleware
  const slug = await uniqueSlug(Product, slugify(data.title));
  const product = await Product.create({ ...data, slug });
  res.status(201).json({ product: toPublicProduct(product.toObject()) });
});

export const update = wrap(async (req, res) => {
  const { id } = req.params;
  if (!OBJECT_ID.test(id)) throw new HttpError(404, 'Product not found.');

  const product = await Product.findById(id);
  if (!product) throw new HttpError(404, 'Product not found.');

  const data = req.body;
  if (data.title && data.title !== product.title) {
    product.slug = await uniqueSlug(Product, slugify(data.title), product._id);
  }
  Object.assign(product, data);
  await product.save();

  res.json({ product: toPublicProduct(product.toObject()) });
});
