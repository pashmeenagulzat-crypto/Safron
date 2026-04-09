<?php
/**
 * Products API – list / detail / categories / featured / search / reviews
 */
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? 'list';
switch ($action) {
    case 'list':       doList();       break;
    case 'detail':     doDetail();     break;
    case 'categories': doCategories(); break;
    case 'featured':   doFeatured();   break;
    case 'search':     doSearch();     break;
    case 'reviews':    doReviews();    break;
    default: jsonResponse(['success'=>false,'message'=>'Invalid action'],400);
}

// ─── helpers ───────────────────────────────────────────────────────────────
function fmtProduct(array $p): array {
    $price    = (float)$p['price'];
    $sale     = $p['sale_price'] ? (float)$p['sale_price'] : null;
    $discount = $sale ? (int)round(($price - $sale) / $price * 100) : 0;
    return [
        'id'                => (int)$p['id'],
        'name'              => $p['name'],
        'slug'              => $p['slug'],
        'short_description' => $p['short_description'],
        'description'       => $p['description'],
        'price'             => $price,
        'sale_price'        => $sale,
        'discount'          => $discount,
        'sku'               => $p['sku'],
        'stock'             => (int)$p['stock_quantity'],
        'weight'            => $p['weight'],
        'origin'            => $p['origin'],
        'image'             => $p['image'],
        'is_featured'       => (bool)$p['is_featured'],
        'rating'            => (float)$p['rating'],
        'review_count'      => (int)$p['review_count'],
        'category_name'     => $p['category_name'],
        'category_slug'     => $p['category_slug'],
    ];
}

// ─── list ──────────────────────────────────────────────────────────────────
function doList(): void {
    $pdo   = db();
    $cat   = clean($_GET['category'] ?? '');
    $page  = max(1,(int)($_GET['page'] ?? 1));
    $limit = min(20,max(1,(int)($_GET['limit'] ?? 12)));
    $off   = ($page-1)*$limit;
    $sorts = [
        'price_asc'  => 'COALESCE(p.sale_price,p.price) ASC',
        'price_desc' => 'COALESCE(p.sale_price,p.price) DESC',
        'rating'     => 'p.rating DESC',
        'newest'     => 'p.created_at DESC',
        'default'    => 'p.sort_order ASC,p.id ASC',
    ];
    $ob    = $sorts[$_GET['sort'] ?? 'default'] ?? $sorts['default'];
    $where = 'p.is_active=1';
    $params= [];
    if ($cat) { $where .= ' AND c.slug=?'; $params[]=$cat; }

    $cnt = $pdo->prepare("SELECT COUNT(*) FROM products p JOIN categories c ON p.category_id=c.id WHERE $where");
    $cnt->execute($params);
    $total = (int)$cnt->fetchColumn();

    $params[]=$limit; $params[]=$off;
    $stmt = $pdo->prepare(
        "SELECT p.*,c.name AS category_name,c.slug AS category_slug
         FROM products p JOIN categories c ON p.category_id=c.id
         WHERE $where ORDER BY $ob LIMIT ? OFFSET ?"
    );
    $stmt->execute($params);
    $rows = array_map('fmtProduct',$stmt->fetchAll());

    jsonResponse(['success'=>true,'products'=>$rows,'total'=>$total,'page'=>$page,'pages'=>(int)ceil($total/$limit)]);
}

// ─── detail ────────────────────────────────────────────────────────────────
function doDetail(): void {
    $slug = clean($_GET['slug'] ?? '');
    $id   = (int)($_GET['id'] ?? 0);
    if (!$slug && !$id) jsonResponse(['success'=>false,'message'=>'slug or id required'],422);

    $col  = $slug ? 'p.slug' : 'p.id';
    $val  = $slug ?: $id;
    $stmt = db()->prepare(
        "SELECT p.*,c.name AS category_name,c.slug AS category_slug
         FROM products p JOIN categories c ON p.category_id=c.id
         WHERE $col=? AND p.is_active=1"
    );
    $stmt->execute([$val]);
    $p = $stmt->fetch();
    if (!$p) jsonResponse(['success'=>false,'message'=>'Product not found'],404);
    jsonResponse(['success'=>true,'product'=>fmtProduct($p)]);
}

// ─── categories ────────────────────────────────────────────────────────────
function doCategories(): void {
    $rows = db()->query(
        'SELECT c.*,COUNT(p.id) AS product_count
         FROM categories c
         LEFT JOIN products p ON p.category_id=c.id AND p.is_active=1
         WHERE c.is_active=1 GROUP BY c.id ORDER BY c.sort_order'
    )->fetchAll();
    jsonResponse(['success'=>true,'categories'=>$rows]);
}

// ─── featured ──────────────────────────────────────────────────────────────
function doFeatured(): void {
    $limit = min(8,max(1,(int)($_GET['limit'] ?? 6)));
    $stmt  = db()->prepare(
        'SELECT p.*,c.name AS category_name,c.slug AS category_slug
         FROM products p JOIN categories c ON p.category_id=c.id
         WHERE p.is_featured=1 AND p.is_active=1 ORDER BY p.sort_order LIMIT ?'
    );
    $stmt->execute([$limit]);
    jsonResponse(['success'=>true,'products'=>array_map('fmtProduct',$stmt->fetchAll())]);
}

// ─── search ────────────────────────────────────────────────────────────────
function doSearch(): void {
    $q = clean($_GET['q'] ?? '');
    if (strlen($q)<2) jsonResponse(['success'=>false,'message'=>'Query too short'],422);
    $like = '%'.$q.'%';
    $stmt = db()->prepare(
        'SELECT p.*,c.name AS category_name,c.slug AS category_slug
         FROM products p JOIN categories c ON p.category_id=c.id
         WHERE p.is_active=1 AND (p.name LIKE ? OR p.short_description LIKE ? OR c.name LIKE ?)
         ORDER BY p.is_featured DESC,p.rating DESC LIMIT 20'
    );
    $stmt->execute([$like,$like,$like]);
    jsonResponse(['success'=>true,'products'=>array_map('fmtProduct',$stmt->fetchAll()),'query'=>$q]);
}

// ─── reviews ───────────────────────────────────────────────────────────────
function doReviews(): void {
    $pid = (int)($_GET['product_id'] ?? 0);
    if (!$pid) jsonResponse(['success'=>false,'message'=>'product_id required'],422);
    $stmt = db()->prepare(
        'SELECT r.*,u.name AS user_name FROM reviews r
         LEFT JOIN users u ON r.user_id=u.id
         WHERE r.product_id=? AND r.is_approved=1 ORDER BY r.created_at DESC LIMIT 20'
    );
    $stmt->execute([$pid]);
    jsonResponse(['success'=>true,'reviews'=>$stmt->fetchAll()]);
}
