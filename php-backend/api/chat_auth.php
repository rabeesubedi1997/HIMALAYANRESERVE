<?php
declare(strict_types=1);

require_once __DIR__ . '/../inc/customer_auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    hr_json(['error' => 'Method not allowed.'], 405);
}

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) {
    hr_json(['error' => 'Invalid JSON body.'], 400);
}

$action = (string) ($body['action'] ?? '');
$ip = hr_customer_client_ip();

if ($action === 'me') {
    hr_json(['customer' => hr_current_customer()]);
}

// A visitor-solvable arithmetic challenge — no third-party CAPTCHA service,
// no account/API key needed. Doesn't stop a determined targeted attacker,
// but blocks the generic form-filling bots that create the bulk of spam
// signups, since the answer is only known server-side (in the session)
// until submitted back.
if ($action === 'captcha') {
    hr_customer_session_start();
    $a = random_int(1, 9);
    $b = random_int(1, 9);
    $_SESSION['captcha_answer'] = $a + $b;
    hr_json(['question' => "$a + $b"]);
}

if ($action === 'register') {
    // Honeypot — same pattern as the allocation form.
    if (trim((string) ($body['website'] ?? '')) !== '') {
        hr_json(['ok' => true], 201);
    }

    hr_customer_session_start();
    $expected = $_SESSION['captcha_answer'] ?? null;
    unset($_SESSION['captcha_answer']); // one-time use either way
    $submitted = $body['captchaAnswer'] ?? null;
    if ($expected === null || (int) $submitted !== (int) $expected) {
        hr_json(['error' => 'Incorrect answer to the verification question. Please try again.', 'captchaFailed' => true], 422);
    }

    $name = trim((string) ($body['name'] ?? ''));
    $email = strtolower(trim((string) ($body['email'] ?? '')));
    $password = (string) ($body['password'] ?? '');

    if (mb_strlen($name) < 2 || mb_strlen($name) > 120) {
        hr_json(['error' => 'Please enter your name.'], 422);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 190) {
        hr_json(['error' => 'Please enter a valid email address.'], 422);
    }
    if (strlen($password) < 8) {
        hr_json(['error' => 'Password must be at least 8 characters.'], 422);
    }

    try {
        $pdo = hr_db();

        // Per-IP rate limit — a handful of real signups from one IP
        // (household/office) is normal, dozens is scripted abuse.
        $rate = $pdo->prepare('SELECT COUNT(*) AS n FROM customers WHERE ip = ? AND created_at > (NOW() - INTERVAL 1 HOUR)');
        $rate->execute([$ip]);
        if ((int) ($rate->fetch()['n'] ?? 0) >= 5) {
            hr_json(['error' => 'Too many accounts created from this network recently. Please try again later.'], 429);
        }

        $dup = $pdo->prepare('SELECT id FROM customers WHERE email = ? LIMIT 1');
        $dup->execute([$email]);
        if ($dup->fetch()) {
            hr_json(['error' => 'An account with this email already exists — try signing in instead.'], 409);
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $pdo->prepare('INSERT INTO customers (name, email, password_hash, ip) VALUES (?, ?, ?, ?)')->execute([$name, $email, $hash, $ip]);
        $id = (int) $pdo->lastInsertId();

        hr_customer_session_start();
        session_regenerate_id(true);
        $_SESSION['customer_id'] = $id;
        $_SESSION['customer_name'] = $name;
        $_SESSION['customer_email'] = $email;

        hr_json(['ok' => true, 'customer' => ['id' => $id, 'name' => $name, 'email' => $email]], 201);
    } catch (Throwable $e) {
        error_log('chat_auth register failed: ' . $e->getMessage());
        hr_json(['error' => 'Unable to create account. Please try again.'], 500);
    }
}

if ($action === 'login') {
    $email = strtolower(trim((string) ($body['email'] ?? '')));
    $password = (string) ($body['password'] ?? '');

    if (hr_customer_login_locked_out($ip)) {
        hr_json(['error' => 'Too many attempts. Please try again in ' . HR_CUSTOMER_LOGIN_LOCKOUT_MINUTES . ' minutes.'], 429);
    }
    if ($email === '' || $password === '') {
        hr_json(['error' => 'Please enter your email and password.'], 422);
    }

    try {
        $stmt = hr_db()->prepare('SELECT id, name, email, password_hash FROM customers WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $customer = $stmt->fetch();

        $hash = $customer['password_hash'] ?? '$2y$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva';
        $ok = password_verify($password, $hash);

        if (!$customer || !$ok) {
            hr_record_failed_customer_login($ip, $email);
            hr_json(['error' => 'Invalid email or password.'], 401);
        }

        hr_clear_failed_customer_logins($ip);
        hr_customer_session_start();
        session_regenerate_id(true);
        $_SESSION['customer_id'] = (int) $customer['id'];
        $_SESSION['customer_name'] = $customer['name'];
        $_SESSION['customer_email'] = $customer['email'];

        hr_json(['ok' => true, 'customer' => ['id' => (int) $customer['id'], 'name' => $customer['name'], 'email' => $customer['email']]]);
    } catch (Throwable $e) {
        error_log('chat_auth login failed: ' . $e->getMessage());
        hr_json(['error' => 'Sign in temporarily unavailable.'], 500);
    }
}

if ($action === 'logout') {
    hr_customer_session_start();
    $_SESSION = [];
    session_destroy();
    hr_json(['ok' => true]);
}

hr_json(['error' => 'Unknown action.'], 400);
