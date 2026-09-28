# Northwind Market — CodeAlpha Full Stack Internship — Task 1: E-commerce Store

<p align="center">
  <img src="frontend/public/brand/logo-full.svg" alt="Northwind Market logo" width="340" />
</p>

Author: **Shayan Ali Jalbani** (@shayanalibuilds)
Program: CodeAlpha Full Stack Development — Month 1 (M1), Task 1
Stack: **MERN** (MongoDB + Mongoose, Express + Node.js, React 18 + Vite, Tailwind CSS)

> **Payments are mocked.** No real card is charged. Checkout writes an Order document and shows a confirmation page. There is no Stripe, PayPal, Polar, or any real payment SDK in this project.

## 1. What this is

Northwind Market is a simple, family-safe storefront demo for the CodeAlpha internship. It supports:

- Catalog browsing with search, category chips, and sort
- Product detail pages with live stock
- Persistent per-user cart with optimistic quantity steppers
- Mock checkout (address + card/UPI/cash) that decrements real stock
- Customer accounts (register/login/logout) and order history/receipts
- Admin screens for product management and order status

The catalog is intentionally family-safe: books, stationery, backpacks, headphones, water bottles, desk lamps. No adult, dating, alcohol, or weapon products.

## 2. Stack

| Layer    | Choice                              |
| -------- | ----------------------------------- |
| Database | MongoDB + Mongoose ODM              |
| Server   | Express 4 on Node.js                |
| Client   | React 18 + Vite 5                   |
| Styling  | Tailwind CSS 3                       |
| Auth     | JWT bearer + bcrypt password hashing |
| Tests    | Jest + Supertest + mongodb-memory-server |

## 3. Getting started

### 3.1 Prerequisites

- Node.js 18+ (built on Node 24)
- npm 9+
- A MongoDB instance — either local `mongod` on `127.0.0.1:27017`, or a free Atlas cluster

### 3.2 Run MongoDB

**Local:** install `mongodb-community` for your OS and start it (`mongod --dbpath ./data` on Linux/macOS, or run as a Windows service). The default URI is `mongodb://127.0.0.1:27017`.

**Atlas:** create a free M0 cluster at <https://www.mongodb.com/atlas>, add a database user, allow your IP, and copy the connection string. It looks like `mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/northwind_market`.

**Quick demo (no install):** from `backend/`, run `npm run mongo`. This starts an embedded in-memory MongoDB on `127.0.0.1:27017` (the binary downloads once, then is cached). Data is ephemeral — ideal for demos, but re-seed after every restart. The default `MONGO_URI` in `.env.example` already points at it.

> The Mongo URI stays in your local `.env` only — never commit it.

### 3.3 Install and run

```bash
# from repo root
cd backend
cp .env.example .env       # then edit MONGO_URI to match your instance
npm install
npm run seed               # seeds admin + customer users and ≥12 products
npm run dev                # API on http://127.0.0.1:5000

# in a second terminal
cd frontend
npm install
npm run dev                # UI on http://127.0.0.1:5173
```

### 3.4 Seed logins

| Role     | Email                 | Password             |
| -------- | --------------------- | -------------------- |
| Admin    | admin@example.com     | password-admin-12    |
| Customer | customer@example.com  | password-customer-12 |

> Admins cannot be registered from the public sign-up form. The admin account only exists via seed.

## 4. API route table

Base URL: `http://127.0.0.1:5000`

| Method | Path                       | Auth        | Purpose                                  |
| ------ | -------------------------- | ----------- | ---------------------------------------- |
| POST   | `/api/auth/register`       | public      | Create a customer account                |
| POST   | `/api/auth/login`          | public      | Issue a JWT                              |
| GET    | `/api/auth/me`             | customer+   | Current user profile                     |
| POST   | `/api/auth/logout`         | customer+   | Clear client session (stateless server) |
| GET    | `/api/products`            | public      | List/search/sort catalog                 |
| GET    | `/api/products/:id`        | public      | Product detail                           |
| POST   | `/api/products`            | admin       | Create product                           |
| PATCH  | `/api/products/:id`        | admin       | Update / archive product                 |
| GET    | `/api/cart`                | customer+   | Current user's cart                      |
| POST   | `/api/cart/items`          | customer+   | Add item `{ productId, qty }`            |
| PATCH  | `/api/cart/items/:productId` | customer+ | Update qty                               |
| DELETE | `/api/cart/items/:productId` | customer+ | Remove item                              |
| POST   | `/api/orders`              | customer+   | Place order from server cart             |
| GET    | `/api/orders`              | customer+   | Own orders (admin: all orders)           |
| GET    | `/api/orders/:id`          | customer+   | Receipt                                  |
| PATCH  | `/api/orders/:id/status`   | admin       | Update order status                      |

## 5. Pages

| Path               | Auth        | Notes                                       |
| ------------------ | ----------- | ------------------------------------------- |
| `/`                | public      | Catalog grid + search + chips + sort        |
| `/products/:id`    | public      | Detail + stock + add to cart                |
| `/cart`            | public      | Qty steppers, remove, subtotal (guest too)  |
| `/checkout`        | customer    | Address + mock payment + place order        |
| `/orders`          | customer    | Own orders                                  |
| `/orders/:id`      | customer    | Receipt                                     |
| `/login`           | public      | Sign in                                     |
| `/register`        | public      | Sign up                                     |
| `/admin/products`  | admin       | Create / edit / archive product             |
| `/admin/orders`    | admin       | List orders, mark packed/shipped/cancelled  |

## 6. Running tests

```bash
cd backend
npm test
```

The suite covers: auth isolation, customer cannot create product, checkout decrements stock, checkout rejects oversell with 409, foreign order 404. Tests spin up an in-memory MongoDB via `mongodb-memory-server` — no real Mongo needed for tests.

## 7. Project layout

```
CodeAlpha_EcommerceStore/
  backend/
    src/{config,models,middleware,routes,controllers,services,seed,utils}
    tests/
    package.json
    .env.example
  frontend/
    src/{api,components,pages,hooks,context}
    package.json
  README.md
  STATE.md
  .gitignore
```

## 8. Disclaimer

This project is a student internship demo for CodeAlpha. There is **no real payment processing** — checkout is a mock that always succeeds when stock is available. Do not enter real card numbers; any card-shaped string is accepted by the mock.
