import Order from '../models/Order.js';
import { createOrderFromCart, restockOrder } from '../services/orderService.js';
import { HttpError } from '../utils/httpError.js';
import { wrap } from '../utils/asyncHandler.js';

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

const TRANSITIONS = {
  placed: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: [],
  cancelled: [],
};

function toPublicOrder(doc) {
  if (!doc) return null;
  const user =
    doc.user && typeof doc.user === 'object' && '_id' in doc.user
      ? { id: doc.user._id.toString(), name: doc.user.name, email: doc.user.email }
      : { id: doc.user?.toString() };
  return {
    id: doc._id.toString(),
    items: (doc.items || []).map((i) => ({
      title: i.title,
      priceCents: i.priceCents,
      qty: i.qty,
      productId: i.product?.toString?.(),
    })),
    address: doc.address,
    paymentMethod: doc.paymentMethod,
    status: doc.status,
    totalCents: doc.totalCents,
    user,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const create = wrap(async (req, res) => {
  const { address, paymentMethod } = req.body; // validated by middleware
  const order = await createOrderFromCart(req.user, { address, paymentMethod });
  res.status(201).json({ order: toPublicOrder(order.toObject()) });
});

export const list = wrap(async (req, res) => {
  const scopeAll = req.query.scope === 'all' && req.user.role === 'admin';
  const filter = scopeAll ? {} : { user: req.user.id };
  const orders = await Order.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(200)
    .populate('user', 'name email')
    .lean();
  res.json({ orders: orders.map(toPublicOrder) });
});

export const getOne = wrap(async (req, res) => {
  const { id } = req.params;
  if (!OBJECT_ID.test(id)) throw new HttpError(404, 'Order not found.');

  // Owners see their order; admins see any order. Everyone else gets a plain 404
  // (existence of other users' orders is never leaked).
  const filter = req.user.role === 'admin' ? { _id: id } : { _id: id, user: req.user.id };
  const order = await Order.findOne(filter).populate('user', 'name email').lean();
  if (!order) throw new HttpError(404, 'Order not found.');

  res.json({ order: toPublicOrder(order) });
});

export const updateStatus = wrap(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!OBJECT_ID.test(id)) throw new HttpError(404, 'Order not found.');

  const order = await Order.findById(id);
  if (!order) throw new HttpError(404, 'Order not found.');

  if (status !== order.status) {
    const allowed = TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      throw new HttpError(400, `Cannot move an order from "${order.status}" to "${status}".`, {
        status: allowed.length
          ? `From "${order.status}" you can go to: ${allowed.join(', ')}.`
          : `An order that is "${order.status}" cannot change status.`,
      });
    }
    order.status = status;
    await order.save();
    if (status === 'cancelled') await restockOrder(order);
  }

  res.json({ order: toPublicOrder(order.toObject()) });
});
