<?php
// api/order.php – Order placement endpoint

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed', 405);
}

session_start();
$db = getDB();

$body = json_decode(file_get_contents('php://input'), true) ?? [];

// Validate required fields
$required = ['name', 'email', 'phone', 'address', 'city', 'state', 'postal_code'];
foreach ($required as $field) {
    if (empty($body[$field])) {
        errorResponse("Field '$field' is required");
    }
}

if (!filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
    errorResponse('Invalid email address');
}

$cart = $_SESSION['cart'] ?? [];
if (empty($cart)) {
    errorResponse('Cart is empty');
}

// Build order
$subtotal = 0.0;
$lineItems = [];
foreach ($cart as $slug => $qty) {
    $stmt = $db->prepare('SELECT id, name, sku, price, stock FROM products WHERE slug = ? AND active = 1');
    $stmt->execute([$slug]);
    $product = $stmt->fetch();
    if (!$product) continue;
    if ($qty > $product['stock']) {
        errorResponse("Insufficient stock for: {$product['name']}");
    }
    $lineTotal = (float)$product['price'] * $qty;
    $subtotal += $lineTotal;
    $lineItems[] = [
        'product_id'   => $product['id'],
        'product_name' => $product['name'],
        'product_sku'  => $product['sku'],
        'unit_price'   => $product['price'],
        'quantity'     => $qty,
        'subtotal'     => $lineTotal,
    ];
}

if (empty($lineItems)) {
    errorResponse('No valid products in cart');
}

$shipping = ($subtotal < 999) ? 99.0 : 0.0;
$total    = $subtotal + $shipping;
$orderNum = 'ORD-' . strtoupper(substr(md5(uniqid('', true)), 0, 8));

$db->beginTransaction();
try {
    // Upsert customer
    $stmt = $db->prepare('SELECT id FROM customers WHERE email = ?');
    $stmt->execute([$body['email']]);
    $customer = $stmt->fetch();
    if ($customer) {
        $customerId = $customer['id'];
        $upd = $db->prepare('UPDATE customers SET name=?, phone=?, address=?, city=?, state=?, postal_code=? WHERE id=?');
        $upd->execute([$body['name'], $body['phone'], $body['address'], $body['city'], $body['state'], $body['postal_code'], $customerId]);
    } else {
        $ins = $db->prepare('INSERT INTO customers (name, email, phone, address, city, state, postal_code) VALUES (?,?,?,?,?,?,?)');
        $ins->execute([$body['name'], $body['email'], $body['phone'], $body['address'], $body['city'], $body['state'], $body['postal_code']]);
        $customerId = (int)$db->lastInsertId();
    }

    // Insert order
    $stmt = $db->prepare('
        INSERT INTO orders (customer_id, order_number, subtotal, shipping, tax, total, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_postal, shipping_country)
        VALUES (?,?,?,?,0,?,?,?,?,?,?,?,?,?)
    ');
    $stmt->execute([
        $customerId, $orderNum, round($subtotal, 2), round($shipping, 2), round($total, 2),
        $body['name'], $body['email'], $body['phone'], $body['address'],
        $body['city'], $body['state'], $body['postal_code'], $body['country'] ?? 'India',
    ]);
    $orderId = (int)$db->lastInsertId();

    // Insert line items & decrement stock
    foreach ($lineItems as $item) {
        $stmt = $db->prepare('INSERT INTO order_items (order_id, product_id, product_name, product_sku, unit_price, quantity, subtotal) VALUES (?,?,?,?,?,?,?)');
        $stmt->execute([$orderId, $item['product_id'], $item['product_name'], $item['product_sku'], $item['unit_price'], $item['quantity'], $item['subtotal']]);
        $db->prepare('UPDATE products SET stock = stock - ? WHERE id = ?')->execute([$item['quantity'], $item['product_id']]);
    }

    $db->commit();
} catch (Exception $e) {
    $db->rollBack();
    errorResponse('Order placement failed. Please try again.', 500);
}

// Clear cart
$_SESSION['cart'] = [];

jsonResponse([
    'success'      => true,
    'order_number' => $orderNum,
    'total'        => round($total, 2),
    'message'      => 'Order placed successfully! You will receive a confirmation shortly.',
]);
