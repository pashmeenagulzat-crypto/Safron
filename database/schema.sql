-- Safron - Kashmiri Saffron Products eCommerce
-- Database Schema

CREATE DATABASE IF NOT EXISTS safron_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE safron_db;

CREATE TABLE IF NOT EXISTS categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(110) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id INT UNSIGNED NOT NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    short_description VARCHAR(500),
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    sku VARCHAR(100),
    stock INT NOT NULL DEFAULT 0,
    weight_grams INT,
    origin VARCHAR(100) DEFAULT 'Kashmir, India',
    grade VARCHAR(50),
    featured TINYINT(1) NOT NULL DEFAULT 0,
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS product_images (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(200),
    sort_order INT NOT NULL DEFAULT 0,
    is_primary TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS customers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id INT UNSIGNED,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    status ENUM('pending','confirmed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    shipping DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    notes TEXT,
    shipping_name VARCHAR(150),
    shipping_email VARCHAR(200),
    shipping_phone VARCHAR(20),
    shipping_address TEXT,
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(100),
    shipping_postal VARCHAR(20),
    shipping_country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    product_sku VARCHAR(100),
    unit_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Seed: categories
INSERT INTO categories (name, slug, description) VALUES
('Pure Saffron', 'pure-saffron', 'Premium pure Kashmiri saffron threads'),
('Saffron Blends', 'saffron-blends', 'Curated spice blends featuring saffron'),
('Gift Sets', 'gift-sets', 'Luxury saffron gift sets and hampers');

-- Seed: products
INSERT INTO products (category_id, name, slug, short_description, description, price, compare_price, sku, stock, weight_grams, grade, featured) VALUES
(1, 'Kashmiri Mongra Saffron', 'kashmiri-mongra-saffron',
 'Finest Mongra grade saffron – deep red threads, rich aroma.',
 'Kashmiri Mongra Saffron is the highest-grade saffron available, known for its deep crimson colour, intense aroma, and superior colouring power. Hand-picked from the pristine fields of Pampore, Kashmir. Each strand is all-red with no yellow styles, marking it as pure Mongra grade. Perfect for biryanis, desserts, and wellness.',
 2499.00, 2999.00, 'SAF-MON-1G', 50, 1, 'Mongra (A++)', 1),

(1, 'Kashmiri Lacha Saffron', 'kashmiri-lacha-saffron',
 'Premium Lacha grade saffron – long strands, bold colour.',
 'Lacha Saffron from Kashmir features long, intact strands with a vibrant orange-red hue. It delivers a rich golden colour and a warm, honey-like fragrance. Excellent value for everyday cooking and baking. Sourced directly from certified growers in the Karewa plateau of Kashmir.',
 1499.00, 1899.00, 'SAF-LAC-2G', 80, 2, 'Lacha (A+)', 1),

(1, 'Organic Saffron Gift Tin – 5g', 'organic-saffron-gift-tin-5g',
 'Organic certified Kashmiri saffron in a premium tin.',
 'Our 5g organic saffron tin makes a perfect gift. Certified organic by APEDA, this saffron is free of additives and grown without pesticides. It has a rich ISO 3632 Category I rating. Store in the airtight tin away from light and moisture for maximum potency.',
 3999.00, 4999.00, 'SAF-ORG-5G', 30, 5, 'Organic A+', 1),

(2, 'Saffron & Cardamom Blend', 'saffron-cardamom-blend',
 'Aromatic blend of saffron and green cardamom for chai and desserts.',
 'A harmonious blend of Kashmiri saffron threads and hand-selected green cardamom pods. Use a pinch in warm milk, chai, or kheer for an exquisite flavour. Our signature blend is carefully balanced for everyday indulgence.',
 899.00, 1199.00, 'BLN-SAF-CAR-10G', 100, 10, NULL, 0),

(2, 'Golden Biryani Spice Kit', 'golden-biryani-spice-kit',
 'Everything you need for a perfect golden biryani.',
 'This kit contains our Lacha saffron, whole spices (star anise, mace, bay leaf, black cardamom), and a recipe card for the perfect Kashmiri biryani. All ingredients are sourced from Kashmir and neighbouring regions.',
 1299.00, 1599.00, 'KIT-BIR-01', 40, 80, NULL, 0),

(3, 'Royal Saffron Hamper', 'royal-saffron-hamper',
 'Luxurious gift hamper with Mongra saffron, rose water & more.',
 'The Royal Saffron Hamper includes 1g Mongra Saffron, 100ml Kashmiri Rose Water, a hand-embroidered pouch, and a booklet on the heritage of Kashmiri saffron. Beautifully packaged in a walnut-veneer box. Perfect for weddings, festivals, and corporate gifts.',
 4999.00, 6499.00, 'GIFT-ROYAL-01', 20, 500, NULL, 1),

(3, 'Wellness Saffron Kit', 'wellness-saffron-kit',
 'Daily wellness kit: saffron, dried rose buds & herbal honey.',
 'Support your daily wellness routine with our curated kit: 2g Lacha Saffron, 50g dried Kashmiri rose buds, and 250g herbal saffron honey. All products are natural and preservative-free. Includes a wellness guide booklet.',
 2799.00, 3499.00, 'KIT-WELL-01', 25, 350, NULL, 0);

-- Seed: product images (using Unsplash placeholders for demo)
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES
(1, 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&q=80', 'Kashmiri Mongra Saffron threads', 0, 1),
(1, 'https://images.unsplash.com/photo-1628697879230-bc2febb10faf?w=800&q=80', 'Saffron close-up', 1, 0),
(1, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80', 'Saffron in a bowl', 2, 0),

(2, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80', 'Kashmiri Lacha Saffron', 0, 1),
(2, 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&q=80', 'Lacha saffron threads', 1, 0),

(3, 'https://images.unsplash.com/photo-1628697879230-bc2febb10faf?w=800&q=80', 'Organic Saffron Gift Tin', 0, 1),
(3, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80', 'Gift tin open', 1, 0),

(4, 'https://images.unsplash.com/photo-1506368083636-6defb67639c4?w=800&q=80', 'Saffron Cardamom Blend', 0, 1),

(5, 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800&q=80', 'Golden Biryani Spice Kit', 0, 1),

(6, 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80', 'Royal Saffron Hamper', 0, 1),
(6, 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&q=80', 'Hamper contents', 1, 0),

(7, 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=800&q=80', 'Wellness Saffron Kit', 0, 1);
