<?php
/**
 * Database & app configuration for Safron eCommerce
 * Update DB_USER / DB_PASS before deployment
 */

define('DB_HOST',    'localhost');
define('DB_USER',    'root');       // ← change to your MySQL user
define('DB_PASS',    '');           // ← change to your MySQL password
define('DB_NAME',    'safron_db');
define('DB_CHARSET', 'utf8mb4');

define('SITE_URL',         'http://localhost');
define('SITE_NAME',        'Safron – Premium Kashmiri Products');
define('SESSION_LIFETIME', 86400); // 24 h

/** Return (and lazily create) a PDO connection. */
function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn     = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Database connection failed']);
            exit;
        }
    }
    return $pdo;
}

/** Send a JSON response and exit. */
function jsonResponse(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    echo json_encode($data);
    exit;
}

/** Decode JSON request body. */
function body(): array {
    $raw = file_get_contents('php://input');
    if (empty($raw)) return [];
    $d = json_decode($raw, true);
    return is_array($d) ? $d : [];
}

/** HTML-escape a string. */
function clean(string $s): string {
    return htmlspecialchars(trim($s), ENT_QUOTES, 'UTF-8');
}

/** Validate a 10-digit Indian mobile number. */
function validMobile(string $m): bool {
    return (bool)preg_match('/^[6-9]\d{9}$/', $m);
}

/** Generate a numeric OTP of given length. */
function makeOTP(int $len = 6): string {
    return str_pad((string)random_int(0, 10 ** $len - 1), $len, '0', STR_PAD_LEFT);
}

/** Start the session with secure cookie settings. */
function startSession(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => SESSION_LIFETIME,
            'path'     => '/',
            'secure'   => false,   // true in production (HTTPS)
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();
    }
}

/** Return the logged-in user ID or null. */
function authUserId(): ?int {
    startSession();
    return isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;
}

// Handle CORS pre-flight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(200);
    exit;
}
