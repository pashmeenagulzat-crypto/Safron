<?php
// api/cart.php – Cart API endpoint (session-based)

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    exit;
}

session_start();

if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

$method = $_SERVER['REQUEST_METHOD'];

// Helper: re-fetch cart totals
function cartSummary(PDO $db): array {
    $items = [];
    $subtotal = 0.0;
    foreach ($_SESSION['cart'] as $slug => $qty) {
        $stmt = $db->prepare('SELECT id, name, slug, price, stock, (SELECT image_url FROM product_images WHERE product_id = products.id AND is_primary = 1 LIMIT 1) AS image FROM products WHERE slug = ? AND active = 1');
        $stmt->execute([$slug]);
        $p = $stmt->fetch();
        if ($p) {
            $lineTotal = (float)$p['price'] * $qty;
            $subtotal += $lineTotal;
            $items[] = [
                'slug'       => $p['slug'],
                'name'       => $p['name'],
                'price'      => (float)$p['price'],
                'quantity'   => $qty,
                'line_total' => $lineTotal,
                'image'      => $p['image'],
                'stock'      => (int)$p['stock'],
            ];
        }
    }
    $shipping = ($subtotal > 0 && $subtotal < FREE_SHIPPING_THRESHOLD) ? SHIPPING_COST : 0.0;
    return [
        'items'     => $items,
        'count'     => array_sum($_SESSION['cart']),
        'subtotal'  => round($subtotal, 2),
        'shipping'  => $shipping,
        'total'     => round($subtotal + $shipping, 2),
    ];
}

$db = getDB();

if ($method === 'GET') {
    // GET /api/cart.php  – return cart contents
    jsonResponse(['success' => true, 'cart' => cartSummary($db)]);
}

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $action = $body['action'] ?? '';
    $slug   = trim($body['slug'] ?? '');

    if ($slug === '') {
        errorResponse('Product slug is required');
    }

    // Validate product exists
    $stmt = $db->prepare('SELECT id, stock FROM products WHERE slug = ? AND active = 1');
    $stmt->execute([$slug]);
    $product = $stmt->fetch();
    if (!$product) {
        errorResponse('Product not found', 404);
    }

    if ($action === 'add') {
        $qty = max(1, (int)($body['quantity'] ?? 1));
        $current = $_SESSION['cart'][$slug] ?? 0;
        $newQty = $current + $qty;
        if ($newQty > $product['stock']) {
            errorResponse('Not enough stock available');
        }
        $_SESSION['cart'][$slug] = $newQty;

    } elseif ($action === 'update') {
        $qty = max(0, (int)($body['quantity'] ?? 0));
        if ($qty === 0) {
            unset($_SESSION['cart'][$slug]);
        } else {
            if ($qty > $product['stock']) {
                errorResponse('Not enough stock available');
            }
            $_SESSION['cart'][$slug] = $qty;
        }

    } elseif ($action === 'remove') {
        unset($_SESSION['cart'][$slug]);

    } else {
        errorResponse('Unknown action');
    }

    jsonResponse(['success' => true, 'cart' => cartSummary($db)]);
}

if ($method === 'DELETE') {
    // Clear entire cart
    $_SESSION['cart'] = [];
    jsonResponse(['success' => true, 'cart' => cartSummary($db)]);
}

errorResponse('Method not allowed', 405);
