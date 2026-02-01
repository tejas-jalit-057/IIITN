<?php
/**
 * SAST – Authentication API
 * Endpoints (all via GET param ?action=):
 *   login  – POST  { email, password }
 *   signup – POST  { username, email, password }
 *   logout – POST  (needs Authorization: Bearer <token>)
 *   check  – GET   (needs Authorization: Bearer <token>)
 */
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// Route
match ($_GET['action'] ?? '') {
    'login'  => handleLogin(),
    'signup' => handleSignup(),
    'logout' => handleLogout(),
    'check'  => handleCheck(),
    default  => (function(){ http_response_code(400); echo json_encode(['error'=>'Unknown action']); })(),
};

// ─── LOGIN ────────────────────────────────────────────────────
function handleLogin(): void {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $email = trim($b['email'] ?? '');
    $pass  = $b['password'] ?? '';

    if (!$email || !$pass) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required.']);
        return;
    }

    $db   = getDB();
    $stmt = $db->prepare("SELECT id, username, email, password_hash FROM users WHERE email = :e");
    $stmt->execute([':e' => $email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($pass, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid email or password.']);
        return;
    }

    // Create session token (24 h)
    $token = bin2hex(random_bytes(32));
    $exp   = date('Y-m-d H:i:s', time() + 86400);
    $db->prepare("INSERT INTO sessions (user_id, token, expires_at) VALUES (:u,:t,:e)")
       ->execute([':u' => $user['id'], ':t' => $token, ':e' => $exp]);

    echo json_encode([
        'success' => true,
        'token'   => $token,
        'user'    => ['id' => $user['id'], 'username' => $user['username'], 'email' => $user['email']],
    ]);
}

// ─── SIGNUP ───────────────────────────────────────────────────
function handleSignup(): void {
    $b        = json_decode(file_get_contents('php://input'), true) ?? [];
    $username = trim($b['username'] ?? '');
    $email    = trim($b['email']    ?? '');
    $pass     = $b['password'] ?? '';

    if (!$username || !$email || !$pass) {
        http_response_code(400);
        echo json_encode(['error' => 'All fields are required.']); return;
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format.']); return;
    }
    if (strlen($pass) < 6) {
        http_response_code(400);
        echo json_encode(['error' => 'Password must be at least 6 characters.']); return;
    }

    $db = getDB();
    $exists = $db->prepare("SELECT 1 FROM users WHERE email=:e OR username=:u");
    $exists->execute([':e' => $email, ':u' => $username]);
    if ($exists->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Username or email already taken.']); return;
    }

    $db->prepare("INSERT INTO users (username,email,password_hash) VALUES (:u,:e,:h)")
       ->execute([':u' => $username, ':e' => $email, ':h' => password_hash($pass, PASSWORD_BCRYPT)]);

    echo json_encode(['success' => true, 'message' => 'Account created. You can now log in.']);
}

// ─── LOGOUT ───────────────────────────────────────────────────
function handleLogout(): void {
    $token = extractToken();
    if ($token) {
        getDB()->prepare("DELETE FROM sessions WHERE token=:t")->execute([':t' => $token]);
    }
    echo json_encode(['success' => true]);
}

// ─── CHECK SESSION ────────────────────────────────────────────
function handleCheck(): void {
    $token = extractToken();
    if (!$token) { http_response_code(401); echo json_encode(['authenticated'=>false]); return; }

    $stmt = getDB()->prepare(
        "SELECT u.id, u.username, u.email FROM sessions s JOIN users u ON s.user_id=u.id WHERE s.token=:t AND s.expires_at>NOW()"
    );
    $stmt->execute([':t' => $token]);
    $user = $stmt->fetch();

    if (!$user) { http_response_code(401); echo json_encode(['authenticated'=>false]); return; }
    echo json_encode(['authenticated'=>true, 'user'=>$user]);
}

// ─── Extract Bearer token from Authorization header ──────────
function extractToken(): ?string {
    $h = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    return str_starts_with($h,'Bearer ') ? substr($h,7) : null;
}
?>
