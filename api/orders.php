<?php
/**
 * Orders API – place / list / detail
 */
require_once __DIR__ . '/config.php';
startSession();

$action = $_GET['action'] ?? '';
switch ($action) {
    case 'place':  doPlace();  break;
    case 'list':   doList();   break;
    case 'detail': doDetail(); break;
    default: jsonResponse(['success'=>false,'message'=>'Invalid action'],400);
}

// ─── place ─────────────────────────────────────────────────────────────────
function doPlace(): void {
    $d    = body();
    $name = clean($d['name'] ?? '');
    $mob  = clean($d['mobile'] ?? '');
    $mail = clean($d['email'] ?? '');
    $addr = clean($d['address'] ?? '');
    $city = clean($d['city'] ?? '');
    $st   = clean($d['state'] ?? '');
    $pin  = clean($d['pincode'] ?? '');
    $pay  = in_array($d['payment_method']??'cod',['cod','online']) ? $d['payment_method'] : 'cod';
    $note = clean($d['notes'] ?? '');

    if (!$name||!$addr||!$city||!$st||!$pin) jsonResponse(['success'=>false,'message'=>'Fill all required fields'],422);
    if (!validMobile($mob))                   jsonResponse(['success'=>false,'message'=>'Invalid mobile number'],422);

    $pdo = db();
    $uid = authUserId();
    $sid = session_id();

    if ($uid) {
        $stmt = $pdo->prepare('SELECT c.*,p.name,p.price,p.sale_price,p.stock_quantity FROM cart c JOIN products p ON c.product_id=p.id WHERE c.user_id=?');
        $stmt->execute([$uid]);
    } else {
        $stmt = $pdo->prepare('SELECT c.*,p.name,p.price,p.sale_price,p.stock_quantity FROM cart c JOIN products p ON c.product_id=p.id WHERE c.session_id=?');
        $stmt->execute([$sid]);
    }
    $items = $stmt->fetchAll();
    if (!$items) jsonResponse(['success'=>false,'message'=>'Cart is empty'],400);

    $subtotal = 0;
    foreach ($items as $it) {
        $ep = $it['sale_price'] ? (float)$it['sale_price'] : (float)$it['price'];
        $subtotal += $ep * $it['quantity'];
        if ($it['quantity'] > $it['stock_quantity'])
            jsonResponse(['success'=>false,'message'=>"Insufficient stock for {$it['name']}"],409);
    }
    $ship  = $subtotal >= 999 ? 0 : 99;
    $total = $subtotal + $ship;
    $num   = 'SAF'.date('Ymd').strtoupper(substr(uniqid(),-5));

    $pdo->beginTransaction();
    try {
        $pdo->prepare(
            'INSERT INTO orders (order_number,user_id,name,mobile,email,address,city,state,pincode,subtotal,shipping,total,payment_method,notes)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
        )->execute([$num,$uid,$name,$mob,$mail,$addr,$city,$st,$pin,$subtotal,$ship,$total,$pay,$note]);
        $oid = $pdo->lastInsertId();

        foreach ($items as $it) {
            $ep = $it['sale_price'] ? (float)$it['sale_price'] : (float)$it['price'];
            $pdo->prepare('INSERT INTO order_items (order_id,product_id,name,price,quantity,total) VALUES (?,?,?,?,?,?)')
                ->execute([$oid,$it['product_id'],$it['name'],$ep,$it['quantity'],$ep*$it['quantity']]);
            $pdo->prepare('UPDATE products SET stock_quantity=stock_quantity-? WHERE id=?')
                ->execute([$it['quantity'],$it['product_id']]);
        }
        if ($uid) {
            $pdo->prepare('DELETE FROM cart WHERE user_id=?')->execute([$uid]);
        } else {
            $pdo->prepare('DELETE FROM cart WHERE session_id=?')->execute([$sid]);
        }
        $pdo->commit();
        jsonResponse(['success'=>true,'message'=>'Order placed!','order_number'=>$num,'order_id'=>$oid,'total'=>$total]);
    } catch (\Exception $e) {
        $pdo->rollBack();
        jsonResponse(['success'=>false,'message'=>'Failed to place order. Please try again.'],500);
    }
}

// ─── list ──────────────────────────────────────────────────────────────────
function doList(): void {
    $uid = authUserId();
    if (!$uid) jsonResponse(['success'=>false,'message'=>'Login required'],401);
    $stmt = db()->prepare('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC LIMIT 20');
    $stmt->execute([$uid]);
    jsonResponse(['success'=>true,'orders'=>$stmt->fetchAll()]);
}

// ─── detail ────────────────────────────────────────────────────────────────
function doDetail(): void {
    $num = clean($_GET['order_number'] ?? '');
    if (!$num) jsonResponse(['success'=>false,'message'=>'order_number required'],422);

    $pdo  = db();
    $stmt = $pdo->prepare('SELECT * FROM orders WHERE order_number=?');
    $stmt->execute([$num]);
    $order = $stmt->fetch();
    if (!$order) jsonResponse(['success'=>false,'message'=>'Order not found'],404);

    $uid = authUserId();
    if ($order['user_id'] && $order['user_id'] !== $uid)
        jsonResponse(['success'=>false,'message'=>'Unauthorised'],403);

    $stmt = $pdo->prepare('SELECT * FROM order_items WHERE order_id=?');
    $stmt->execute([$order['id']]);
    $order['items'] = $stmt->fetchAll();

    jsonResponse(['success'=>true,'order'=>$order]);
}
