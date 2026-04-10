-- Safron eCommerce Database Schema
-- Run this script in MySQL to set up the database

CREATE DATABASE IF NOT EXISTS safron_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE safron_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(150),
    password_hash VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6),
    otp_expires_at DATETIME,
    is_verified TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image VARCHAR(255),
    is_active TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    sku VARCHAR(100),
    stock_quantity INT DEFAULT 0,
    weight VARCHAR(50),
    origin VARCHAR(100),
    image VARCHAR(255),
    is_featured TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    session_id VARCHAR(100),
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(20) NOT NULL UNIQUE,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    email VARCHAR(150),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    shipping DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cod','online') DEFAULT 'cod',
    payment_status ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
    order_status ENUM('pending','confirmed','processing','shipped','delivered','cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_approved TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Banners table
CREATE TABLE IF NOT EXISTS banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200),
    subtitle VARCHAR(300),
    image VARCHAR(255) NOT NULL,
    link VARCHAR(255),
    button_text VARCHAR(50),
    is_active TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Seed Data
-- ============================================================

INSERT INTO categories (name, slug, description, image, sort_order) VALUES
('Saffron',      'saffron',      'Premium Kashmiri Saffron – harvested from the finest fields of Pampore', 'cat-saffron.svg',      1),
('Dry Fruits',   'dry-fruits',   'Premium quality dry fruits sourced from the finest orchards',            'cat-dryfruits.svg',    2),
('Honey',        'honey',        'Pure natural honey with rich flavour and health benefits',               'cat-honey.svg',        3),
('Herbs & Spices','herbs-spices','Aromatic herbs and exotic spices from the Himalayas',                   'cat-herbs.svg',        4),
('Gift Sets',    'gift-sets',    'Curated premium gift boxes for every occasion',                         'cat-gifts.svg',        5);

INSERT INTO products (category_id, name, slug, short_description, description, price, sale_price, sku, stock_quantity, weight, origin, image, is_featured, rating, review_count, sort_order) VALUES
-- ── Saffron ──────────────────────────────────────────────────────────────────
(1,'Kashmiri Mongra Saffron','kashmiri-mongra-saffron',
 'Premium hand-picked Mongra saffron from Pampore, Kashmir',
 'The finest grade of Kashmiri saffron, known for its deep crimson colour, rich aroma, and exceptional flavour. Hand-picked from the picturesque saffron fields of Pampore, Kashmir. ISO 3632 Grade-1 certified. Rich in crocin, safranal and picrocrocin.',
 2499.00,1999.00,'SAF-MON-1G',50,'1g','Pampore, Kashmir','prod-mongra.svg',1,4.9,128,1),

(1,'Kashmiri Laccha Saffron','kashmiri-laccha-saffron',
 'Whole stigma saffron threads with intense colour and aroma',
 'Laccha saffron with intact red stigmas, offering powerful colour and aroma. Ideal for rice dishes, desserts, and beverages. Sourced directly from certified Kashmiri farmers.',
 1899.00,1499.00,'SAF-LAC-2G',75,'2g','Kashmir Valley','prod-laccha.svg',1,4.8,96,2),

(1,'Saffron Infused Honey','saffron-infused-honey',
 'Pure honey infused with premium Kashmiri saffron',
 'A luxurious blend of pure Kashmiri honey infused with premium saffron strands. Rich in antioxidants and natural goodness. Perfect for skin, wellness and gifting.',
 899.00,749.00,'SAF-HON-250G',100,'250g','Kashmir','prod-saffron-honey.svg',1,4.7,64,3),

(1,'Saffron Milk Mix','saffron-milk-mix',
 'Ready-to-use saffron & almond milk mix for golden milk',
 'Convenience meets luxury. Our Saffron Milk Mix blends Grade-A Kashmiri saffron with almond powder, cardamom, and raw sugar. Just add warm milk for an instant golden latte bursting with antioxidants.',
 649.00,499.00,'SAF-MIX-150G',120,'150g','Kashmir','prod-saffron-milk.svg',1,4.8,82,4),

(1,'Saffron Face Pack','saffron-face-pack',
 'Pure saffron & sandalwood face pack for radiant skin',
 'Harness the beauty secrets of Kashmir with our 100% natural saffron face pack. Blended with sandalwood and rose extracts for a brightening, anti-ageing treatment. Dermatologically tested. Free from parabens and synthetic colours.',
 799.00,649.00,'SAF-FACE-100G',80,'100g','Kashmir','prod-face-pack.svg',0,4.7,53,5),

(1,'Saffron Gift Box (Luxury)','saffron-luxury-gift-box',
 'Premium gift box: Mongra Saffron, Honey, Kawa Tea & more',
 'The perfect gift for connoisseurs. This hand-crafted wooden box contains 1g Mongra Saffron, 100g Wild Honey, 50g Kashmiri Kawa, and 50g Mamra Almonds. Comes with a handwritten gift card.',
 3499.00,2799.00,'GIFT-LUX-01',30,'350g','Kashmir','prod-gift-box.svg',1,5.0,41,6),

-- ── Dry Fruits ────────────────────────────────────────────────────────────────
(2,'Premium Kashmiri Almonds','premium-kashmiri-almonds',
 'Sweet Kashmiri Mamra almonds – rich in nutrients',
 'Fresh Kashmiri Mamra almonds, known for their distinctively sweet taste and high oil content. Rich in protein, healthy fats, and vitamins. Cold-pressed, not heat-processed.',
 1299.00,999.00,'DRY-ALM-500G',150,'500g','Kashmir','prod-almonds.svg',1,4.8,87,7),

(2,'Kesar Pista','kesar-pista',
 'Premium pistachios with a delicate saffron coating',
 'Premium green pistachios lightly coated with Kashmiri saffron. A royal snack combining crunch with exotic flavour.',
 1599.00,1299.00,'DRY-PIS-250G',80,'250g','Kashmir/Afghanistan','prod-pista.svg',0,4.6,45,8),

(2,'Dried Apricots (Khumani)','dried-apricots',
 'Sun-dried natural apricots from Ladakh orchards',
 'Naturally sun-dried apricots from the orchards of Ladakh. No preservatives, no added sugar. Rich in Vitamin A, fibre, and iron.',
 799.00,649.00,'DRY-APR-500G',120,'500g','Ladakh','prod-apricots.svg',0,4.5,38,9),

(2,'Kashmiri Walnuts (Doda)','kashmiri-walnuts',
 'Paper-shell Kashmiri walnuts with rich buttery taste',
 'The world-famous Kashmiri paper-shell walnuts (Doda variety), celebrated for their thin shell, plump kernel, and rich, buttery flavour. Exceptionally rich in Omega-3 fatty acids.',
 1199.00,949.00,'DRY-WAL-500G',90,'500g','Sopore, Kashmir','prod-walnuts.svg',1,4.9,112,10),

(2,'Premium Cashews (Kaju)','premium-cashews',
 'Jumbo W180 cashews – buttery, creamy, premium grade',
 'Grade W180 jumbo cashews, the finest size available. Naturally sweet and creamy with a buttery texture. Source-verified from Goa.',
 1499.00,1199.00,'DRY-KAJ-500G',110,'500g','Goa','prod-cashews.svg',0,4.7,67,11),

-- ── Honey ─────────────────────────────────────────────────────────────────────
(3,'Wild Forest Honey','wild-forest-honey',
 'Raw unprocessed Himalayan wild forest honey',
 'Unprocessed raw honey collected from wild bee colonies in Himalayan forests. Dark amber colour with robust complex flavour. NMR tested for purity.',
 799.00,649.00,'HON-WLD-500G',90,'500g','Himachal Pradesh','prod-forest-honey.svg',1,4.7,72,12),

(3,'Acacia Flower Honey','acacia-flower-honey',
 'Light and delicate honey from acacia blossoms',
 'Light, mild honey collected from acacia blossoms. Known for its delicate flavour and very slow crystallisation. Lab tested for purity.',
 599.00,499.00,'HON-ACA-500G',110,'500g','Jammu & Kashmir','prod-acacia-honey.svg',0,4.5,41,13),

(3,'Tulsi Honey','tulsi-honey',
 'Medicinal honey infused with pure Himalayan Tulsi (Holy Basil)',
 'Raw Himalayan honey infused with organic Tulsi (Holy Basil) extract. Used in Ayurveda for immunity, respiratory health, and stress relief. Cold-processed to retain bioactive compounds.',
 699.00,549.00,'HON-TUL-300G',75,'300g','Uttarakhand','prod-tulsi-honey.svg',1,4.8,58,14),

(3,'Comb Honey (Raw Honeycomb)','raw-honeycomb',
 'Pure beeswax honeycomb straight from the hive',
 'Honey in its most natural form — directly from the beeswax comb. Hand-cut from wild hives in Kashmir forests. Contains natural pollen, propolis, and royal jelly.',
 1299.00,NULL,'HON-COMB-300G',40,'300g','Kashmir Forests','prod-honeycomb.svg',1,4.9,34,15),

-- ── Herbs & Spices ────────────────────────────────────────────────────────────
(4,'Kashmiri Kawa Tea','kashmiri-kawa-tea',
 'Traditional Kashmiri green tea with saffron and spices',
 'Traditional Kashmiri Kawa blend with saffron, cardamom, cinnamon, and rose petals. A warming aromatic brew rich in antioxidants, cherished for centuries.',
 699.00,549.00,'HRB-KAW-100G',200,'100g','Kashmir Valley','prod-kawa.svg',1,4.9,156,16),

(4,'Himalayan Shilajit','himalayan-shilajit',
 'Pure Grade-A Himalayan Shilajit resin with fulvic acid',
 'Pure Grade A Shilajit resin sourced from high-altitude Himalayan rocks. A powerful adaptogen with fulvic acid and 85+ minerals. Used in Ayurveda for energy and vitality.',
 1999.00,1699.00,'HRB-SHI-20G',60,'20g','Himalayas (>16,000ft)','prod-shilajit.svg',1,4.8,93,17),

(4,'Kashmiri Pink Salt','kashmiri-pink-salt',
 'Mineral-rich Himalayan pink rock salt – coarse and fine grind',
 'Authentic Himalayan pink salt harvested from ancient sea salt deposits. Contains 84 trace minerals including calcium, magnesium, and potassium. Ideal for cooking, bath soaks, and salt lamps.',
 349.00,279.00,'HRB-SALT-500G',300,'500g','Khewra (Himalayan)','prod-pink-salt.svg',0,4.6,149,18),

(4,'Kashmiri Rose Water (Gulab Jal)','kashmiri-rose-water',
 'Steam-distilled pure Kashmiri Damask rose water',
 'Premium rose water steam-distilled from fresh Damask roses. Zero additives. Used in cuisine, skincare, and aromatherapy for centuries.',
 499.00,399.00,'HRB-ROSE-200ML',150,'200ml','Kannauj / Kashmir','prod-rose-water.svg',0,4.7,78,19),

(4,'Saffron Gold Ghee','saffron-gold-ghee',
 'A2 Bilona cow ghee enriched with Kashmiri saffron',
 'A2 Desi Cow Ghee prepared using the traditional Bilona method, infused with hand-picked Kashmiri saffron. Deeply nourishing with a golden hue and rich aroma.',
 1799.00,1499.00,'HRB-GHEE-250G',55,'250g','Rajasthan / Kashmir','prod-saffron-ghee.svg',1,4.9,67,20);

INSERT INTO banners (title, subtitle, image, link, button_text, sort_order) VALUES
('Pure Kashmiri Saffron', 'Hand-picked from the heart of Pampore – experience the world\'s finest saffron', 'banner1.svg', 'products.html?category=saffron', 'Shop Saffron', 1),
('Nature\'s Finest Gifts', 'Premium dry fruits, wild honey & Himalayan herbs – crafted for your wellbeing', 'banner2.svg', 'products.html', 'Explore Products', 2),
('The Kawa Experience',   'Warm your soul with our signature Kashmiri Kawa tea infused with saffron',       'banner3.svg', 'products.html?category=herbs-spices', 'Order Now', 3);
