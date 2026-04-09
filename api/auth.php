<?php
/**
 * Auth API – signup / login / logout / send-otp / verify-otp / forgot-password / reset-password / me
 */
require_once __DIR__ . '/config.php';
startSession();

$action = $_GET['action'] ?? '';
switch ($action) {
    case 'signup':         doSignup();         break;
    case 'login':          doLogin();          break;
    case 'logout':         doLogout();         break;
    case 'send-otp':       doSendOTP();        break;
    case 'verify-otp':     doVerifyOTP();      break;
    case 'forgot-password':doForgotPassword(); break;
    case 'reset-password': doResetPassword();  break;
    case 'me':             doGetMe();          break;
    default: jsonResponse(['success' => false, 'message' => 'Invalid action'], 400);
}

// ─── signup ────────────────────────────────────────────────────────────────
function doSignup(): void {
    $d    = body();
    $name = clean($d['name'] ?? '');
    $mob  = clean($d['mobile'] ?? '');
    $pass = $d['password'] ?? '';
    $mail = clean($d['email'] ?? '');

    if (strlen($name) < 2)      jsonResponse(['success'=>false,'message'=>'Enter a valid name'],422);
    if (!validMobile($mob))     jsonResponse(['success'=>false,'message'=>'Enter a valid 10-digit mobile number'],422);
    if (strlen($pass) < 6)      jsonResponse(['success'=>false,'message'=>'Password must be at least 6 characters'],422);

    $pdo  = db();
    $stmt = $pdo->prepare('SELECT id FROM users WHERE mobile=?');
    $stmt->execute([$mob]);
    if ($stmt->fetch()) jsonResponse(['success'=>false,'message'=>'Mobile number already registered'],409);

    $hash   = password_hash($pass, PASSWORD_BCRYPT, ['cost'=>12]);
    $otp    = makeOTP();
    $expiry = date('Y-m-d H:i:s', strtotime('+10 minutes'));

    $pdo->prepare('INSERT INTO users (name,mobile,email,password_hash,otp_code,otp_expires_at,is_verified) VALUES (?,?,?,?,?,?,0)')
        ->execute([$name,$mob,$mail,$hash,$otp,$expiry]);

    $uid = $pdo->lastInsertId();
    // In production: send OTP via SMS. Here it is returned for dev/demo.
    jsonResponse(['success'=>true,'message'=>'Account created. Verify your mobile.','user_id'=>$uid,'otp'=>$otp]);
}

// ─── login ─────────────────────────────────────────────────────────────────
function doLogin(): void {
    $d    = body();
    $mob  = clean($d['mobile'] ?? '');
    $pass = $d['password'] ?? '';

    if (!validMobile($mob))  jsonResponse(['success'=>false,'message'=>'Enter a valid mobile number'],422);
    if (empty($pass))        jsonResponse(['success'=>false,'message'=>'Password is required'],422);

    $pdo  = db();
    $stmt = $pdo->prepare('SELECT * FROM users WHERE mobile=? AND is_active=1');
    $stmt->execute([$mob]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($pass, $user['password_hash']))
        jsonResponse(['success'=>false,'message'=>'Invalid mobile number or password'],401);

    $_SESSION['user_id']   = $user['id'];
    $_SESSION['user_name'] = $user['name'];

    jsonResponse(['success'=>true,'message'=>'Login successful','user'=>[
        'id'=>$user['id'],'name'=>$user['name'],'mobile'=>$user['mobile'],
        'email'=>$user['email'],'is_verified'=>(bool)$user['is_verified'],
    ]]);
}

// ─── logout ────────────────────────────────────────────────────────────────
function doLogout(): void {
    $_SESSION = [];
    session_destroy();
    jsonResponse(['success'=>true,'message'=>'Logged out']);
}

// ─── send-otp ──────────────────────────────────────────────────────────────
function doSendOTP(): void {
    $d   = body();
    $mob = clean($d['mobile'] ?? '');
    if (!validMobile($mob)) jsonResponse(['success'=>false,'message'=>'Invalid mobile number'],422);

    $pdo  = db();
    $stmt = $pdo->prepare('SELECT id FROM users WHERE mobile=?');
    $stmt->execute([$mob]);
    if (!$stmt->fetch()) jsonResponse(['success'=>false,'message'=>'Mobile number not found'],404);

    $otp    = makeOTP();
    $expiry = date('Y-m-d H:i:s', strtotime('+10 minutes'));
    $pdo->prepare('UPDATE users SET otp_code=?,otp_expires_at=? WHERE mobile=?')
        ->execute([$otp,$expiry,$mob]);

    jsonResponse(['success'=>true,'message'=>'OTP sent','otp'=>$otp]); // Remove 'otp' in production
}

// ─── verify-otp ────────────────────────────────────────────────────────────
function doVerifyOTP(): void {
    $d   = body();
    $mob = clean($d['mobile'] ?? '');
    $otp = clean($d['otp'] ?? '');

    if (!validMobile($mob) || strlen($otp)!==6)
        jsonResponse(['success'=>false,'message'=>'Invalid input'],422);

    $pdo  = db();
    $stmt = $pdo->prepare('SELECT * FROM users WHERE mobile=?');
    $stmt->execute([$mob]);
    $user = $stmt->fetch();

    if (!$user)                            jsonResponse(['success'=>false,'message'=>'User not found'],404);
    if ($user['otp_code']!==$otp)          jsonResponse(['success'=>false,'message'=>'Incorrect OTP'],401);
    if (strtotime($user['otp_expires_at'])<time())
        jsonResponse(['success'=>false,'message'=>'OTP expired. Request a new one.'],410);

    $pdo->prepare('UPDATE users SET is_verified=1,otp_code=NULL,otp_expires_at=NULL WHERE id=?')
        ->execute([$user['id']]);

    $_SESSION['user_id']   = $user['id'];
    $_SESSION['user_name'] = $user['name'];

    jsonResponse(['success'=>true,'message'=>'Mobile verified!','user'=>['id'=>$user['id'],'name'=>$user['name'],'mobile'=>$mob]]);
}

// ─── forgot-password ───────────────────────────────────────────────────────
function doForgotPassword(): void {
    $d   = body();
    $mob = clean($d['mobile'] ?? '');
    if (!validMobile($mob)) jsonResponse(['success'=>false,'message'=>'Invalid mobile number'],422);

    $pdo  = db();
    $stmt = $pdo->prepare('SELECT id FROM users WHERE mobile=? AND is_active=1');
    $stmt->execute([$mob]);
    $user = $stmt->fetch();

    if (!$user) {
        // Prevent user enumeration – always return success
        jsonResponse(['success'=>true,'message'=>'If this number is registered, an OTP has been sent']);
    }

    $otp    = makeOTP();
    $expiry = date('Y-m-d H:i:s', strtotime('+15 minutes'));
    $pdo->prepare('UPDATE users SET otp_code=?,otp_expires_at=? WHERE id=?')
        ->execute([$otp,$expiry,$user['id']]);

    jsonResponse(['success'=>true,'message'=>'OTP sent to your mobile','otp'=>$otp]); // Remove 'otp' in production
}

// ─── reset-password ────────────────────────────────────────────────────────
function doResetPassword(): void {
    $d    = body();
    $mob  = clean($d['mobile'] ?? '');
    $otp  = clean($d['otp'] ?? '');
    $pass = $d['password'] ?? '';

    if (!validMobile($mob)||strlen($otp)!==6) jsonResponse(['success'=>false,'message'=>'Invalid input'],422);
    if (strlen($pass)<6)  jsonResponse(['success'=>false,'message'=>'Password must be at least 6 characters'],422);

    $pdo  = db();
    $stmt = $pdo->prepare('SELECT * FROM users WHERE mobile=?');
    $stmt->execute([$mob]);
    $user = $stmt->fetch();

    if (!$user||$user['otp_code']!==$otp)
        jsonResponse(['success'=>false,'message'=>'Invalid OTP'],401);
    if (strtotime($user['otp_expires_at'])<time())
        jsonResponse(['success'=>false,'message'=>'OTP expired'],410);

    $hash = password_hash($pass, PASSWORD_BCRYPT, ['cost'=>12]);
    $pdo->prepare('UPDATE users SET password_hash=?,otp_code=NULL,otp_expires_at=NULL WHERE id=?')
        ->execute([$hash,$user['id']]);

    jsonResponse(['success'=>true,'message'=>'Password reset successfully. Please login.']);
}

// ─── me ────────────────────────────────────────────────────────────────────
function doGetMe(): void {
    $uid = authUserId();
    if (!$uid) jsonResponse(['success'=>false,'message'=>'Not authenticated'],401);

    $stmt = db()->prepare('SELECT id,name,mobile,email,is_verified,address,city,state,pincode,created_at FROM users WHERE id=?');
    $stmt->execute([$uid]);
    $user = $stmt->fetch();
    if (!$user) jsonResponse(['success'=>false,'message'=>'User not found'],404);

    jsonResponse(['success'=>true,'user'=>$user]);
}
