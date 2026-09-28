import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { HttpError } from '../utils/httpError.js';
import { wrap } from '../utils/asyncHandler.js';

const MAX_QTY = 99;
const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

// Price/stock always come from the Product document — never from the client.
async function cartResponse(userId) {
  const cart = await Cart.findOne({ user: userId }).populate('items.product').lean();
  if (!cart) return { items: [], count: 0, subtotalCents: 0 };

  const items = [];
  const deadIds = [];
  for (const item of cart.items) {
    if (item.product && !item.product.archived) {
      items.push({
        productId: item.product._id.toString(),
        qty: item.qty,
        title: item.product.title,
        slug: item.product.slug,
        imageUrl: item.product.imageUrl,
        priceCents: item.product.priceCents,
        stock: item.product.stock,
      });
    } else {
      deadIds.push(item.product?._id);
    }
  }

  // Self-heal: drop items whose product vanished or was archived.
  if (deadIds.length) {
    await Cart.updateOne({ _id: cart._id }, { $pull: { items: { product: { $in: deadIds } } } });
  }

  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotalCents = items.reduce((sum, i) => sum + i.qty * i.priceCents, 0);
  return { items, count, subtotalCents };
}

export const show = wrap(async (req, res) => {
  res.json({ cart: await cartResponse(req.user.id) });
});

export const addItem = wrap(async (req, res) => {
  const { productId, qty } = req.body;
  if (!OBJECT_ID.test(productId)) {
    throw new HttpError(400, 'That product id does not look right.', {
      productId: 'Use a valid product id.',
    });
  }

  const product = await Product.findById(productId);
  if (!product || product.archived) {
    throw new HttpError(404, 'Product not found.');
  }

  const cart = await getOrCreateCart(req.user.id);
  const existing = cart.items.find((i) => i.product.toString() === productId);
  const newQty = (existing?.qty || 0) + qty;
  const maxQty = Math.min(product.stock, MAX_QTY);

  if (product.stock === 0) {
    throw new HttpError(409, `Sorry, "${product.title}" is out of stock right now.`, {
      qty: `Sorry, "${product.title}" is out of stock right now.`,
    });
  }
  if (newQty > maxQty) {
    throw new HttpError(409, `Only ${product.stock} left of "${product.title}".`, {
      qty: `Only ${product.stock} left of "${product.title}". Lower the quantity to continue.`,
    });
  }

  if (existing) existing.qty = newQty;
  else cart.items.push({ product: productId, qty });
  await cart.save();

  res.status(201).json({ cart: await cartResponse(req.user.id) });
});

export const updateItem = wrap(async (req, res) => {
  const { productId } = req.params;
  if (!OBJECT_ID.test(productId)) {
    throw new HttpError(404, 'That item is not in your cart.');
  }

  const cart = await Cart.findOne({ user: req.user.id });
  const item = cart?.items.find((i) => i.product.toString() === productId);
  if (!item) {
    throw new HttpError(404, 'That item is not in your cart.');
  }

  const product = await Product.findById(productId);
  if (!product || product.archived) {
    throw new HttpError(404, 'Product not found.');
  }

  const maxQty = Math.min(product.stock, MAX_QTY);
  if (req.body.qty > maxQty) {
    throw new HttpError(409, `Only ${product.stock} left of "${product.title}".`, {
      qty: `Only ${product.stock} left of "${product.title}". Lower the quantity to continue.`,
    });
  }

  item.qty = req.body.qty;
  await cart.save();

  res.json({ cart: await cartResponse(req.user.id) });
});

export const removeItem = wrap(async (req, res) => {
  const { productId } = req.params;
  await Cart.updateOne({ user: req.user.id }, { $pull: { items: { product: productId } } });
  res.json({ cart: await cartResponse(req.user.id) });
});
