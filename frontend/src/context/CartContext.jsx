import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getCart, addCartItem, updateCartItem, removeCartItem } from '../api/cart.js';
import { getProduct } from '../api/products.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);
const GUEST_KEY = 'nw_guest_cart';
const MAX_QTY = 99;

function readGuest() {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGuest(items) {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(items));
  } catch {
    // storage full/blocked — cart still works in memory for this tab
  }
}

// Shape used everywhere on the client. Prices come from the server; at checkout
// the server cart is the single source of truth.
function normalize(item) {
  return {
    productId: item.productId,
    qty: item.qty,
    title: item.title,
    slug: item.slug,
    imageUrl: item.imageUrl,
    priceCents: item.priceCents,
    stock: item.stock,
  };
}

function fromProduct(product, qty) {
  return {
    productId: product.id,
    qty,
    title: product.title,
    slug: product.slug,
    imageUrl: product.imageUrl,
    priceCents: product.priceCents,
    stock: product.stock,
  };
}

// Stock ceiling for a cart line, capped at MAX_QTY. Unknown/absent stock
// counts as zero — the bag never offers more than the shelf can fulfill.
// (The server re-validates every write for signed-in users.)
function maxQtyFor(stock) {
  return Math.min(Number.isFinite(stock) ? stock : 0, MAX_QTY);
}

// Friendly, field-mapped error for stock-limited cart writes.
function stockLimitError(title, stock) {
  const err = new Error(
    stock > 0
      ? `Only ${stock} left of "${title}". Lower the quantity to continue.`
      : `Sorry, "${title}" is out of stock right now.`
  );
  err.fields = { qty: err.message };
  return err;
}

// The cart could not confirm live stock (API hiccup, offline, malformed
// payload). Fail-closed: refuse the write rather than risk overselling.
function stockUnverifiedError(title) {
  const err = new Error(
    `Couldn't verify the stock for "${title}" — please try again in a moment.`
  );
  err.fields = { qty: err.message };
  return err;
}

// Live stock straight from the catalog. A 404 means the product is gone or
// archived — reported as sold out; any other failure means we genuinely
// cannot verify, which must block the write instead of guessing.
async function liveStockOrThrow(productId, title) {
  try {
    const data = await getProduct(productId);
    const stock = data?.product?.stock;
    if (!Number.isFinite(stock)) throw new Error('Malformed product payload.');
    return stock;
  } catch (err) {
    if (err?.status === 404) return 0;
    throw stockUnverifiedError(title);
  }
}

export function CartProvider({ children }) {
  const { user, ready } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Load: server cart for signed-in users (merging any guest cart), localStorage for guests.
  useEffect(() => {
    if (!ready) return undefined;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (user) {
          let serverItems = [];
          try {
            const data = await getCart();
            serverItems = data.cart.items;
          } catch {
            // API hiccup — start with empty rather than blocking the UI
          }
          const guestItems = readGuest();
          if (guestItems.length) {
            for (const gi of guestItems) {
              try {
                const data = await addCartItem(gi.productId, gi.qty);
                serverItems = data.cart.items;
              } catch {
                // out of stock or product gone — drop the guest line silently
              }
            }
            writeGuest([]);
          }
          if (!cancelled) setItems(serverItems.map(normalize));
        } else if (!cancelled) {
          setItems(readGuest());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, user]);

  const persistGuest = useCallback((next) => {
    writeGuest(next);
    setItems(next);
  }, []);

  // THE single gate every add-to-cart button goes through — product cards,
  // landing quick-adds, PDP "Add to cart" / "Buy now", and anything added in
  // the future. No caller can push a line past the shelf:
  //   - stock is resolved from the freshest source available;
  //   - guests have no server-side guard, so EVERY guest add is verified
  //     against live catalog stock first (also self-heals stale snapshots);
  //   - signed-in adds pre-check against a known snapshot when available
  //     (the server authoritatively re-validates the real write, 409 → resync)
  //     and fetch live stock when the snapshot is missing;
  //   - unknown or unverifiable stock fails closed.
  // Never call the cart API directly from a button — route it through here.
  const add = useCallback(
    async (product, qty = 1) => {
      const prev = itemsRef.current;
      const existing = prev.find((i) => i.productId === product.id);
      const title = product.title || existing?.title || 'This item';

      let stock = Number.isFinite(product.stock) ? product.stock : existing?.stock;
      if (!user || !Number.isFinite(stock)) {
        stock = await liveStockOrThrow(product.id, title);
      }

      const targetQty = (existing?.qty || 0) + qty;
      if (!stock || stock <= 0 || targetQty > maxQtyFor(stock)) {
        throw stockLimitError(title, stock || 0);
      }

      // Carry the freshest known stock onto the line so later UI caps and
      // notices describe the shelf as it is right now.
      const next = existing
        ? prev.map((i) => (i.productId === product.id ? { ...i, qty: targetQty, stock } : i))
        : [...prev, { ...fromProduct(product, qty), stock }];

      if (user) {
        setItems(next);
        try {
          const data = await addCartItem(product.id, qty);
          setItems(data.cart.items.map(normalize));
        } catch (err) {
          if (err?.status === 409) {
            // Stock rejection — adopt the server's cart as-is. This both rolls
            // the optimistic bump back and refreshes stale stock snapshots.
            try {
              const fresh = await getCart();
              setItems(fresh.cart.items.map(normalize));
            } catch {
              setItems(prev);
            }
          } else {
            setItems(prev);
          }
          throw err;
        }
        return;
      }

      // Guest cart lives in localStorage.
      persistGuest(next);
    },
    [user, persistGuest]
  );

  // Same gate for quantity changes. Raising a line can never pass live stock
  // (fetched fresh when the line's snapshot is missing/stale); lowering is
  // always allowed — a shrinking shelf must never trap items in the bag.
  const updateQty = useCallback(
    async (productId, qty) => {
      const prev = itemsRef.current;
      const item = prev.find((i) => i.productId === productId);
      if (!item) return;

      const raising = qty > (item.qty || 0);
      let stock = item.stock;
      if (raising && !Number.isFinite(stock)) {
        stock = await liveStockOrThrow(productId, item.title);
      }
      if (raising && qty > maxQtyFor(stock)) {
        throw stockLimitError(item.title, Number.isFinite(stock) ? stock : 0);
      }

      const patchLine = (i) =>
        i.productId === productId
          ? { ...i, qty, ...(Number.isFinite(stock) ? { stock } : {}) }
          : i;

      if (user) {
        setItems(prev.map(patchLine));
        try {
          const data = await updateCartItem(productId, qty);
          setItems(data.cart.items.map(normalize));
        } catch (err) {
          if (err?.status === 409) {
            try {
              const fresh = await getCart();
              setItems(fresh.cart.items.map(normalize));
            } catch {
              setItems(prev);
            }
          } else {
            setItems(prev);
          }
          throw err;
        }
        return;
      }

      persistGuest(prev.map(patchLine));
    },
    [user, persistGuest]
  );

  const remove = useCallback(
    async (productId) => {
      const prev = itemsRef.current;
      setItems(prev.filter((i) => i.productId !== productId));
      if (!user) {
        persistGuest(prev.filter((i) => i.productId !== productId));
        return;
      }
      try {
        const data = await removeCartItem(productId);
        setItems(data.cart.items.map(normalize));
      } catch (err) {
        setItems(prev);
        throw err;
      }
    },
    [user, persistGuest]
  );

  const clear = useCallback(() => {
    setItems([]);
    writeGuest([]);
  }, []);

  // Re-sync with the server cart (used after order placement / login edge cases).
  const refresh = useCallback(async () => {
    if (!userRef.current) return;
    try {
      const data = await getCart();
      setItems(data.cart.items.map(normalize));
    } catch {
      // keep whatever is on screen
    }
  }, []);

  // Stable refs for the latest values inside stable callbacks.
  const userRef = useRef(user);
  userRef.current = user;

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);
  const subtotalCents = useMemo(
    () => items.reduce((sum, i) => sum + i.qty * i.priceCents, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, count, subtotalCents, loading, add, updateQty, remove, clear, refresh }),
    [items, count, subtotalCents, loading, add, updateQty, remove, clear, refresh]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
