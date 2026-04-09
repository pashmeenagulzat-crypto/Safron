<?php
/** Banners API */
require_once __DIR__ . '/config.php';
$stmt = db()->query('SELECT * FROM banners WHERE is_active=1 ORDER BY sort_order');
jsonResponse(['success'=>true,'banners'=>$stmt->fetchAll()]);
