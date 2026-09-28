// Seed: two demo users + a family-safe catalog. Safe to re-run.
// Wipes products/carts/orders for a deterministic demo, then upserts users.
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import { hashPassword } from '../utils/password.js';

const USERS = [
  { name: 'Store Admin', email: 'admin@example.com', password: 'password-admin-12', role: 'admin' },
  { name: 'Sample Customer', email: 'customer@example.com', password: 'password-customer-12', role: 'customer' },
];

// Family-safe catalog: books, stationery, bags, audio, desk & drinkware.
const PRODUCTS = [
  // Books (4)
  { title: "Star Stories: A Kid's Guide to the Night Sky", slug: 'star-stories-kids-guide-night-sky', category: 'books', priceCents: 1499, stock: 24, emoji: '🌟', description: 'A warmly illustrated guide to constellations, planets, and the stories people have told about the night sky for centuries.' },
  { title: 'The Marvelous Museum of Shapes', slug: 'marvelous-museum-of-shapes', category: 'books', priceCents: 999, stock: 30, emoji: '🔷', description: 'A picture book where triangles, circles, and spirals wander through a magical museum. Perfect for ages 4-8.' },
  { title: 'Adventures of the Paper Crane', slug: 'adventures-of-the-paper-crane', category: 'books', priceCents: 1249, stock: 18, emoji: '🦢', description: 'A chapter book about a folded paper crane that comes to life and travels the world collecting kindness.' },
  { title: 'My First World Atlas, Illustrated Edition', slug: 'my-first-world-atlas-illustrated', category: 'books', priceCents: 1899, stock: 12, emoji: '🗺️', description: 'Big maps, friendly facts, and colorful continents — an atlas designed for curious young readers.' },

  // Stationery (4)
  { title: 'Sunrise Spiral Notebook, 3-Pack', slug: 'sunrise-spiral-notebook-3-pack', category: 'stationery', priceCents: 749, stock: 40, emoji: '📒', description: 'Three dotted spiral notebooks with soft covers in sunrise shades. Great for notes, sketches, and plans.' },
  { title: 'Gel Pen Rainbow Set, 12 Colors', slug: 'gel-pen-rainbow-set-12-colors', category: 'stationery', priceCents: 599, stock: 60, emoji: '🖊️', description: 'Twelve smooth-writing gel pens in rainbow colors, with quick-dry ink that will not smudge your notes.' },
  { title: 'Colored Pencils, 24-Count Tin', slug: 'colored-pencils-24-count-tin', category: 'stationery', priceCents: 1199, stock: 35, emoji: '🎨', description: 'Twenty-four pre-sharpened colored pencils in a sturdy collectible tin. Rich pigment, easy blending.' },
  { title: 'Pastel Sticky Notes, 5-Pack', slug: 'pastel-sticky-notes-5-pack', category: 'stationery', priceCents: 449, stock: 55, emoji: '🗒️', description: 'Five pads of pastel sticky notes that hold firmly and peel cleanly. Perfect for bookmarks and reminders.' },

  // Bags (3)
  { title: 'Sprout Everyday Backpack, Fern Green', slug: 'sprout-everyday-backpack-fern-green', category: 'bags', priceCents: 3499, stock: 15, emoji: '🎒', description: 'A water-resistant backpack with a padded laptop sleeve, bottle pocket, and comfy adjustable straps.' },
  { title: 'Canvas Book Tote, Denim Blue', slug: 'canvas-book-tote-denim-blue', category: 'bags', priceCents: 1999, stock: 20, emoji: '👜', description: 'A heavy-duty canvas tote that easily carries a stack of library books, with an inner zip pocket.' },
  { title: 'Cherry Insulated Lunch Bag', slug: 'cherry-insulated-lunch-bag', category: 'bags', priceCents: 1499, stock: 22, emoji: '🍒', description: 'A compact insulated lunch bag in cherry red with a wipe-clean lining and a mesh side pocket.' },

  // Audio (2)
  { title: 'CloudSoft Over-Ear Headphones', slug: 'cloudsoft-over-ear-headphones', category: 'audio', priceCents: 2999, stock: 12, emoji: '🎧', description: 'Feather-light over-ear headphones with plush cushions and a volume limiter for safe listening.' },
  { title: 'Pebble Mini Bluetooth Speaker', slug: 'pebble-mini-bluetooth-speaker', category: 'audio', priceCents: 2199, stock: 16, emoji: '🔊', description: 'A pocket-size speaker with surprisingly big sound, 10-hour battery, and a braided lanyard.' },

  // Desk & drinkware (2)
  { title: 'Glow Study Desk Lamp, Warm White', slug: 'glow-study-desk-lamp-warm-white', category: 'desk', priceCents: 2499, stock: 10, emoji: '💡', description: 'A fold-flat desk lamp with three warm brightness levels and a phone stand built into the base.' },
  { title: 'Sip-All-Day Water Bottle, 750 ml', slug: 'sip-all-day-water-bottle-750ml', category: 'desk', priceCents: 1399, stock: 45, emoji: '💧', description: 'A leak-proof stainless bottle that keeps drinks cold for 18 hours, with time-of-day markers.' },
];

async function main() {
  await connectDB();

  // Deterministic demo: clear transactional + catalog data, keep the DB names clean.
  await Promise.all([Order.deleteMany({}), Cart.deleteMany({}), Product.deleteMany({})]);

  for (const u of USERS) {
    const passwordHash = await hashPassword(u.password);
    await User.updateOne(
      { email: u.email },
      { $set: { name: u.name, email: u.email, passwordHash, role: u.role } },
      { upsert: true }
    );
  }

  await Product.insertMany(
    PRODUCTS.map((p) => ({ ...p, imageUrl: `/images/products/${p.slug}.svg`, archived: false }))
  );

  const counts = {
    users: await User.countDocuments({}),
    products: await Product.countDocuments({}),
    categories: [...new Set(PRODUCTS.map((p) => p.category))].length,
  };
  console.log(`[seed] done: ${counts.users} users, ${counts.products} products across ${counts.categories} categories`);
  console.log('[seed] admin@example.com / password-admin-12 (admin)');
  console.log('[seed] customer@example.com / password-customer-12 (customer)');

  await closeDB();
}

main().catch((err) => {
  console.error('[seed] failed:', err.message);
  console.error('[seed] is MongoDB running? Start it (or `npm run mongo` for the embedded demo DB) and try again.');
  process.exit(1);
});
