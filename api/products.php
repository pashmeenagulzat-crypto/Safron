<?php
// api/products.php – Products API endpoint

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Method not allowed', 405);
}

$db = getDB();

// Route: /api/products.php?action=list[&category=slug][&featured=1]
// Route: /api/products.php?action=get&slug=product-slug
// Route: /api/products.php?action=categories

$action = $_GET['action'] ?? 'list';

switch ($action) {
    case 'categories':
        $stmt = $db->query('SELECT id, name, slug, description FROM categories ORDER BY name');
        jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
        break;

    case 'get':
        $slug = trim($_GET['slug'] ?? '');
        if ($slug === '') {
            errorResponse('Product slug is required');
        }
        $stmt = $db->prepare('
            SELECT p.*, c.name AS category_name, c.slug AS category_slug
            FROM products p
            JOIN categories c ON c.id = p.category_id
            WHERE p.slug = ? AND p.active = 1
        ');
        $stmt->execute([$slug]);
        $product = $stmt->fetch();
        if (!$product) {
            errorResponse('Product not found', 404);
        }
        // Fetch images
        $imgStmt = $db->prepare('SELECT image_url, alt_text, sort_order, is_primary FROM product_images WHERE product_id = ? ORDER BY sort_order');
        $imgStmt->execute([$product['id']]);
        $product['images'] = $imgStmt->fetchAll();
        jsonResponse(['success' => true, 'data' => $product]);
        break;

    case 'list':
    default:
        $where = ['p.active = 1'];
        $params = [];

        if (!empty($_GET['category'])) {
            $where[] = 'c.slug = ?';
            $params[] = $_GET['category'];
        }
        if (!empty($_GET['featured'])) {
            $where[] = 'p.featured = 1';
        }
        if (!empty($_GET['search'])) {
            $where[] = '(p.name LIKE ? OR p.short_description LIKE ?)';
            $term = '%' . $_GET['search'] . '%';
            $params[] = $term;
            $params[] = $term;
        }

        $whereClause = implode(' AND ', $where);
        $sql = "
            SELECT p.id, p.name, p.slug, p.short_description, p.price, p.compare_price,
                   p.stock, p.grade, p.featured, p.weight_grams,
                   c.name AS category_name, c.slug AS category_slug,
                   (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image,
                   (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 0 ORDER BY sort_order LIMIT 1) AS hover_image
            FROM products p
            JOIN categories c ON c.id = p.category_id
            WHERE $whereClause
            ORDER BY p.featured DESC, p.created_at DESC
        ";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
        break;
}
