# 🌸 Safron – Premium Kashmiri Products

A full-stack eCommerce web application for a brand selling premium saffron and organic products.

## Tech Stack

| Layer     | Technology                         |
|-----------|------------------------------------|
| Frontend  | HTML5, CSS3, Vanilla JavaScript    |
| Backend   | Core PHP 8+ (no framework)         |
| Database  | MySQL 5.7+                         |
| Design    | Mobile-first responsive (gold/saffron theme) |

---

## Features

### 🔐 User Authentication
- Signup / Login with mobile number + password
- OTP verification (6-digit, auto-advance inputs)
- Forgot password + OTP-based reset
- Session-based auth with secure cookie settings

### 🏠 Homepage
- Auto-scroll hero banner slider with 3 slides
- Promo strip & trust badges
- Category grid (Saffron, Dry Fruits, Honey, Herbs)
- Featured products section (loaded from DB)
- Testimonials, "Why Choose Us" section
- Sticky navigation with search, cart badge, user state

### 🛍️ Product System
- Full product listing with filters (by category), sorting, pagination
- Product detail page: gallery, price, meta, description, reviews
- Search across products and categories
- Wishlist button (UI)

### 🛒 Cart & Checkout
- Persistent cart (session-based for guests, user-linked when logged in)
- Quantity controls, remove items, clear cart
- Free-shipping progress bar (free at ₹999+)
- Checkout form with COD / Online payment
- Order placement with stock decrement

### ✅ Order Flow
- Place order → order confirmation page with order number
- Order history (for logged-in users via API)

---

## Quick Setup

### 1. Database

```bash
mysql -u root -p < database/schema.sql
```

### 2. Configure DB connection

Edit `api/config.php` and set your MySQL credentials:

```php
define('DB_USER', 'your_user');
define('DB_PASS', 'your_password');
```

### 3. Run locally

```bash
# PHP built-in server
php -S localhost:8080

# Then open:
# http://localhost:8080
```

---

## File Structure

```
Safron/
├── index.html              # Homepage
├── login.html              # Login page
├── signup.html             # Signup page
├── verify-otp.html         # OTP verification
├── forgot-password.html    # Forgot password
├── reset-password.html     # Reset password
├── products.html           # Product listing
├── product.html            # Product detail
├── cart.html               # Shopping cart
├── checkout.html           # Checkout
├── order-confirmation.html # Order success
│
├── css/
│   └── style.css           # All styles (mobile-first)
│
├── js/
│   ├── main.js             # Shared utilities, toast, auth state, cart badge
│   ├── auth.js             # Auth page logic
│   ├── products.js         # Products listing & filters
│   ├── product.js          # Product detail page
│   ├── cart.js             # Cart page
│   └── checkout.js         # Checkout page
│
├── api/
│   ├── config.php          # DB config & helpers
│   ├── auth.php            # Auth endpoints
│   ├── products.php        # Products endpoints
│   ├── cart.php            # Cart endpoints
│   ├── orders.php          # Orders endpoints
│   └── banners.php         # Banners endpoint
│
├── database/
│   └── schema.sql          # Full DB schema + seed data
│
└── images/
    ├── placeholder.svg
    └── prod-*.svg          # Product images (SVG)
```

---

## API Endpoints

| File | Actions |
|------|---------|
| `api/auth.php` | signup, login, logout, send-otp, verify-otp, forgot-password, reset-password, me |
| `api/products.php` | list, detail, categories, featured, search, reviews |
| `api/cart.php` | get, add, update, remove, clear, count |
| `api/orders.php` | place, list, detail |
| `api/banners.php` | — (returns all active banners) |

---

## Production Notes

- Remove the `'otp'` field from auth API responses (it's only included for demo/development)
- Set `'secure' => true` in session cookie params when using HTTPS
- Integrate an SMS provider (e.g., Twilio, MSG91) to send real OTPs
- Integrate Razorpay/PayU for online payments
- Add rate limiting to auth endpoints
