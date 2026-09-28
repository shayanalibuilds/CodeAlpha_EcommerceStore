import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getCart, addCartItem, updateCartItem, removeCartItem } from '../api/cart.js';
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

  // Optimistic add: bump the UI immediately, reconcile with the server after.
  const add = useCallback(
    async (product, qty = 1) => {
      const prev = itemsRef.current;

      if (product.stock === 0) {
        throw new Error(`Sorry, "${product.title}" is out of stock right now.`);
      }

      if (user) {
        const next = [...prev];
        const existing = next.find((i) => i.productId === product.id);
        if (existing) existing.qty = Math.min(existing.qty + qty, MAX_QTY);
        else next.push(fromProduct(product, qty));
        setItems(next);
        try {
          const data = await addCartItem(product.id, qty);
          setItems(data.cart.items.map(normalize));
        } catch (err) {
          setItems(prev); // revert on stock errors
          throw err;
        }
        return;
      }

      // Guest cart lives in localStorage; stock checked against the card snapshot.
      const maxQty = Math.min(product.stock, MAX_QTY);
      const next = [...prev];
      const existing = next.find((i) => i.productId === product.id);
      const targetQty = (existing?.qty || 0) + qty;
      if (targetQty > maxQty) {
        const err = new Error(
          `Only ${product.stock} left of "${product.title}". Lower the quantity to continue.`
        );
        err.fields = { qty: err.message };
        throw err;
      }
      if (existing) existing.qty = targetQty;
      else next.push(fromProduct(product, qty));
      persistGuest(next);
    },
    [user, persistGuest]
  );

  const updateQty = useCallback(
    async (productId, qty) => {
      const prev = itemsRef.current;
      const item = prev.find((i) => i.productId === productId);
      if (!item) return;

      if (user) {
        const next = prev.map((i) => (i.productId === productId ? { ...i, qty } : i));
        setItems(next);
        try {
          const data = await updateCartItem(productId, qty);
          setItems(data.cart.items.map(normalize));
        } catch (err) {
          setItems(prev);
          throw err;
        }
        return;
      }

      const maxQty = Math.min(item.stock, MAX_QTY);
      if (qty > maxQty) {
        const err = new Error(
          `Only ${item.stock} left of "${item.title}". Lower the quantity to continue.`
        );
        err.fields = { qty: err.message };
        throw err;
      }
      persistGuest(prev.map((i) => (i.productId === productId ? { ...i, qty } : i)));
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
