<?php
/**
 * Cart API – get / add / update / remove / clear / count
 */
require_once __DIR__ . '/config.php';
startSession();

$action = $_GET['action'] ?? 'get';
switch ($action) {
    case 'get':    doGet();    break;
    case 'add':    doAdd();    break;
    case 'update': doUpdate(); break;
    case 'remove': doRemove(); break;
    case 'clear':  doClear();  break;
    case 'count':  doCount();  break;
    default: jsonResponse(['success'=>false,'message'=>'Invalid action'],400);
}

// ─── helpers ───────────────────────────────────────────────────────────────
function cartWhere(): array {
    $uid = authUserId();
    $sid = session_id();
    if ($uid) return ['user_id=?', [$uid]];
    return ['session_id=?', [$sid]];
}

// ─── get ───────────────────────────────────────────────────────────────────
function doGet(): void {
    [$where,$params] = cartWhere();
    $stmt = db()->prepare(
        "SELECT c.id,c.product_id,c.quantity,p.name,p.slug,p.image,p.price,p.sale_price,p.stock_quantity
         FROM cart c JOIN products p ON c.product_id=p.id WHERE c.$where ORDER BY c.created_at DESC"
    );
    $stmt->execute($params);
    $items    = $stmt->fetchAll();
    $subtotal = 0;
    foreach ($items as &$it) {
        $unit        = $it['sale_price'] ? (float)$it['sale_price'] : (float)$it['price'];
        $it['unit_price'] = $unit;
        $it['total']      = round($unit * $it['quantity'], 2);
        $subtotal        += $it['total'];
    }
    $ship = $subtotal >= 999 ? 0 : 99;
    jsonResponse(['success'=>true,'items'=>$items,'subtotal'=>round($subtotal,2),'shipping'=>$ship,'total'=>round($subtotal+$ship,2),'count'=>array_sum(array_column($items,'quantity'))]);
}

// ─── add ───────────────────────────────────────────────────────────────────
function doAdd(): void {
    $d   = body();
    $pid = (int)($d['product_id'] ?? 0);
    $qty = max(1,(int)($d['quantity'] ?? 1));
    if (!$pid) jsonResponse(['success'=>false,'message'=>'product_id required'],422);

    $pdo  = db();
    $stmt = $pdo->prepare('SELECT id,stock_quantity FROM products WHERE id=? AND is_active=1');
    $stmt->execute([$pid]);
    $prod = $stmt->fetch();
    if (!$prod) jsonResponse(['success'=>false,'message'=>'Product not found'],404);
    if ($prod['stock_quantity'] < $qty) jsonResponse(['success'=>false,'message'=>'Insufficient stock'],409);

    [$where,$params] = cartWhere();
    $chk = $pdo->prepare("SELECT id,quantity FROM cart WHERE $where AND product_id=?");
    $chk->execute(array_merge($params,[$pid]));
    $ex  = $chk->fetch();

    if ($ex) {
        $nq = min($ex['quantity']+$qty, $prod['stock_quantity']);
        $pdo->prepare('UPDATE cart SET quantity=? WHERE id=?')->execute([$nq,$ex['id']]);
    } else {
        $uid = authUserId();
        $sid = session_id();
        if ($uid) {
            $pdo->prepare('INSERT INTO cart (user_id,session_id,product_id,quantity) VALUES (?,?,?,?)')->execute([$uid,$sid,$pid,$qty]);
        } else {
            $pdo->prepare('INSERT INTO cart (session_id,product_id,quantity) VALUES (?,?,?)')->execute([$sid,$pid,$qty]);
        }
    }
    jsonResponse(['success'=>true,'message'=>'Added to cart']);
}

// ─── update ────────────────────────────────────────────────────────────────
function doUpdate(): void {
    $d   = body();
    $cid = (int)($d['cart_id'] ?? 0);
    $qty = (int)($d['quantity'] ?? 0);
    if (!$cid) jsonResponse(['success'=>false,'message'=>'cart_id required'],422);

    [$where,$params] = cartWhere();
    $pdo = db();
    if ($qty <= 0) {
        $pdo->prepare("DELETE FROM cart WHERE id=? AND $where")->execute(array_merge([$cid],$params));
        jsonResponse(['success'=>true,'message'=>'Item removed']);
    }
    $pdo->prepare("UPDATE cart SET quantity=? WHERE id=? AND $where")->execute(array_merge([$qty,$cid],$params));
    jsonResponse(['success'=>true,'message'=>'Cart updated']);
}

// ─── remove ────────────────────────────────────────────────────────────────
function doRemove(): void {
    $d   = body();
    $cid = (int)($d['cart_id'] ?? 0);
    if (!$cid) jsonResponse(['success'=>false,'message'=>'cart_id required'],422);

    [$where,$params] = cartWhere();
    db()->prepare("DELETE FROM cart WHERE id=? AND $where")->execute(array_merge([$cid],$params));
    jsonResponse(['success'=>true,'message'=>'Item removed']);
}

// ─── clear ─────────────────────────────────────────────────────────────────
function doClear(): void {
    [$where,$params] = cartWhere();
    db()->prepare("DELETE FROM cart WHERE $where")->execute($params);
    jsonResponse(['success'=>true,'message'=>'Cart cleared']);
}

// ─── count ─────────────────────────────────────────────────────────────────
function doCount(): void {
    [$where,$params] = cartWhere();
    $cnt = db()->prepare("SELECT COALESCE(SUM(quantity),0) FROM cart WHERE $where");
    $cnt->execute($params);
    jsonResponse(['success'=>true,'count'=>(int)$cnt->fetchColumn()]);
}
