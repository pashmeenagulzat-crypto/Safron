# 🌸 Safron – Premium Kashmiri Products eCommerce

A full-featured eCommerce application for premium Kashmiri products (Saffron, Dry Fruits, Honey, Herbs & Spices).

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | **React 19 + TypeScript** (Vite), Tailwind CSS 3, React Router v7 |
| Backend  | **PHP 8** REST API (Core PHP, no framework) |
| Database | **MySQL 8** |
| Cart     | LocalStorage (demo) / PHP sessions (live) |

---

## 🚀 Quick Start (Frontend Demo)

The React app ships with **built-in demo data** — no database or PHP server needed.

```bash
cd client
npm install
npm run dev
# Open http://localhost:5173
```

Demo login: **Mobile:** `9999999999` / **Password:** `demo123`

---

## 🗄️ Full Stack Setup

### 1. Database
```sql
-- Import the schema + seed data
mysql -u root -p < database/schema.sql
```

### 2. PHP API
Any PHP 8+ server (XAMPP, Laragon, etc.):
```bash
# Point your web server root to: /Safron  (or use PHP built-in)
php -S localhost:8080
```

### 3. Connect frontend → API
```bash
cd client
# In vite.config.ts the proxy is already set to localhost:8080
npm run dev
```

---

## 📂 Project Structure

```
Safron/
├── api/                  # PHP REST API endpoints
│   ├── config.php        # DB connection, helpers
│   ├── auth.php          # Login, signup, OTP, password reset
│   ├── products.php      # Product listing, detail, categories, reviews
│   ├── cart.php          # Cart CRUD
│   ├── orders.php        # Order placement & history
│   └── banners.php       # Hero banners
├── database/
│   └── schema.sql        # MySQL schema + 20 premium seed products
├── client/               # ← React + TypeScript frontend
│   ├── src/
│   │   ├── types/        # TypeScript interfaces (Product, Cart, User…)
│   │   ├── data/         # 20 premium demo products (static fallback)
│   │   ├── utils/api.ts  # API layer (demo + live PHP)
│   │   ├── context/      # AuthContext, CartContext (React context)
│   │   ├── hooks/        # useToast
│   │   ├── components/   # Header, Footer, ProductCard, UI primitives
│   │   └── pages/        # HomePage, ProductsPage, ProductDetailPage,
│   │                     #   CartPage, CheckoutPage, OrderConfirmation,
│   │                     #   LoginPage, SignupPage
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```

---

## 🛍️ Premium Demo Products (20 products, 5 categories)

### Saffron (6)
| Product | Price |
|---------|-------|
| Kashmiri Mongra Saffron (ISO Grade-1) | ₹1,999 |
| Kashmiri Laccha Saffron | ₹1,499 |
| Saffron Infused Honey | ₹749 |
| Saffron Milk Mix (Golden Latte) | ₹499 |
| Saffron Face Pack | ₹649 |
| Saffron Gift Box (Luxury) | ₹2,799 |

### Dry Fruits (5)
| Product | Price |
|---------|-------|
| Kashmiri Mamra Almonds | ₹999 |
| Kesar Pista | ₹1,299 |
| Dried Apricots (Khumani) | ₹649 |
| Kashmiri Walnuts (Doda) — NEW | ₹949 |
| Premium Cashews W180 — NEW | ₹1,199 |

### Honey (4)
| Product | Price |
|---------|-------|
| Wild Forest Honey (Raw) | ₹649 |
| Acacia Flower Honey | ₹499 |
| Tulsi Honey (Ayurvedic) — NEW | ₹549 |
| Raw Honeycomb — NEW | ₹1,299 |

### Herbs & Spices (5)
| Product | Price |
|---------|-------|
| Kashmiri Kawa Tea | ₹549 |
| Himalayan Shilajit Grade-A | ₹1,699 |
| Kashmiri Pink Salt — NEW | ₹279 |
| Kashmiri Rose Water — NEW | ₹399 |
| Saffron Gold Ghee (A2 Bilona) — NEW | ₹1,499 |

---

## ✨ Features

- 🏠 **Homepage** — Hero slider, category grid, featured products, testimonials
- 🛍️ **Product Listing** — Filters, sort, search, pagination
- 📦 **Product Detail** — Gallery, qty control, reviews, related products, shipping info
- 🛒 **Cart** — Persistent cart, free-shipping progress bar
- 💳 **Checkout** — Delivery form, COD / Online payment, order placement
- ✅ **Order Confirmation** — Confetti animation, order tracking steps
- 🔐 **Auth** — Login / Signup (demo credentials built-in)
- 📱 **Fully Responsive** — Mobile-first design
