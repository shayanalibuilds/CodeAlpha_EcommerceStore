// Order service: the only write path for orders.
// Server cart + Product documents are the source of truth — client prices are ignored.
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { HttpError } from '../utils/httpError.js';

export async function createOrderFromCart(user, { address, paymentMethod }) {
  // Claim the cart atomically: this single write both hands us the lines and
  // empties the cart, so two concurrent checkouts can never both see a full
  // cart. The loser matches nothing and gets the plain empty-cart error —
  // one cart can therefore produce at most one order, however many parallel
  // submits (double-click, retry, two tabs) arrive.
  const claimed = await Cart.findOneAndUpdate(
    { user: user.id, 'items.0': { $exists: true } },
    { $set: { items: [] } },
    { new: false, lean: true } // the PRE-update document holds the claimed lines
  );
  if (!claimed || !claimed.items?.length) {
    throw new HttpError(400, 'Your cart is empty. Add something before checkout.', {
      cart: 'Your cart is empty. Add something before checkout.',
    });
  }

  // Raw (unpopulated) lines for the compensation path below.
  const claimedItems = claimed.items.map((i) => ({ product: i.product, qty: i.qty }));
  const cart = await Cart.populate(claimed, { path: 'items.product' });

  const decremented = [];
  try {
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

    // Atomic guarded decrement per line. This keeps stock consistent even
    // when two buyers race for the last unit.
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

    // Success: the cart stays claimed (emptied) — the order owns the items now.
    return order;
  } catch (err) {
    // Anything after the claim failed (validation, stock race, Order.create):
    // put every already-decremented line back on the shelf and restore the
    // claimed items — but only if the user has not started a fresh cart in
    // the meantime, which we must not clobber. Best effort: never mask the
    // original failure.
    for (const line of decremented) {
      await Product.updateOne({ _id: line.product }, { $inc: { stock: line.qty } }).catch(() => {});
    }
    await Cart.updateOne(
      { _id: claimed._id, 'items.0': { $exists: false } },
      { $set: { items: claimedItems } }
    ).catch(() => {});
    throw err;
  }
}

// Cancelling an order gives the items back to the shelf.
export async function restockOrder(order) {
  for (const line of order.items) {
    await Product.updateOne({ _id: line.product }, { $inc: { stock: line.qty } });
  }
}
