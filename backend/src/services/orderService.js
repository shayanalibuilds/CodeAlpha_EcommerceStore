// Order service: the only write path for orders.
// Server cart + Product documents are the source of truth — client prices are ignored.
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { HttpError } from '../utils/httpError.js';

export async function createOrderFromCart(user, { address, paymentMethod }) {
  const cart = await Cart.findOne({ user: user.id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    throw new HttpError(400, 'Your cart is empty. Add something before checkout.', {
      cart: 'Your cart is empty. Add something before checkout.',
    });
  }

  // Re-read every product: archive state, price, and stock come from the DB.
  const lines = [];
  for (const item of cart.items) {
    const p = item.product;
    if (!p || p.archived) {
      throw new HttpError(409, 'Some items in your cart are no longer available. Review your cart.', {
        cart: 'Some items in your cart are no longer available. Review your cart.',
      });
    }
    if (!Number.isInteger(item.qty) || item.qty < 1) {
      throw new HttpError(409, 'Some quantities look wrong. Review your cart.', {
        cart: 'Some quantities look wrong. Review your cart.',
      });
    }
    if (p.stock < item.qty) {
      throw new HttpError(
        409,
        `Only ${p.stock} left of "${p.title}". Reduce the quantity to continue.`,
        { cart: `Only ${p.stock} left of "${p.title}". Reduce the quantity to continue.` }
      );
    }
    lines.push({ product: p._id, title: p.title, priceCents: p.priceCents, qty: item.qty });
  }

  // Atomic guarded decrement per line, with compensation if a later line fails.
  // This keeps stock consistent even when two buyers race for the last unit.
  const decremented = [];
  try {
    for (const line of lines) {
      const result = await Product.updateOne(
        { _id: line.product, archived: false, stock: { $gte: line.qty } },
        { $inc: { stock: -line.qty } }
      );
      if (result.modifiedCount !== 1) {
        throw new HttpError(
          409,
          `Stock for "${line.title}" changed while you were checking out. Review your cart and try again.`,
          { cart: `Stock for "${line.title}" changed while you were checking out. Review your cart and try again.` }
        );
      }
      decremented.push(line);
    }
  } catch (err) {
    for (const line of decremented) {
      await Product.updateOne({ _id: line.product }, { $inc: { stock: line.qty } });
    }
    throw err;
  }

  const totalCents = lines.reduce((sum, l) => sum + l.priceCents * l.qty, 0);

  // Mock payment: always succeeds when stock is OK. No gateway is contacted.
  const order = await Order.create({
    user: user.id,
    items: lines,
    address,
    paymentMethod,
    status: 'placed',
    totalCents,
  });

  // Empty the cart after success.
  await Cart.updateOne({ _id: cart._id }, { $set: { items: [] } });

  return order;
}

// Cancelling an order gives the items back to the shelf.
export async function restockOrder(order) {
  for (const line of order.items) {
    await Product.updateOne({ _id: line.product }, { $inc: { stock: line.qty } });
  }
}
