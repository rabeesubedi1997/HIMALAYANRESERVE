<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

const HR_CUSTOMER_LOGIN_MAX_ATTEMPTS = 8;
const HR_CUSTOMER_LOGIN_LOCKOUT_MINUTES = 15;

function hr_customer_session_start(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_set_cookie_params([
            'lifetime' => 60 * 60 * 24 * 30,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
            'secure' => (($_SERVER['HTTPS'] ?? '') !== '') || (($_SERVER['SERVER_PORT'] ?? '') === '443'),
        ]);
        // Distinct cookie name from the admin session (hr_admin_session) so
        // a browser can be logged into both independently.
        session_name('hr_customer_session');
        session_start();
    }
}

function hr_current_customer(): ?array
{
    hr_customer_session_start();
    if (empty($_SESSION['customer_id'])) {
        return null;
    }
    return [
        'id' => (int) $_SESSION['customer_id'],
        'name' => (string) ($_SESSION['customer_name'] ?? ''),
        'email' => (string) ($_SESSION['customer_email'] ?? ''),
    ];
}

/** For JSON API endpoints: emits 401 JSON instead of redirecting. */
function hr_require_customer_api(): array
{
    $customer = hr_current_customer();
    if (!$customer) {
        hr_json(['error' => 'Not signed in.'], 401);
    }
    return $customer;
}

function hr_customer_client_ip(): string
{
    $fwd = trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '')[0]);
    return $fwd ?: ($_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown');
}

function hr_customer_login_locked_out(string $ip): bool
{
    try {
        $stmt = hr_db()->prepare(
            'SELECT COUNT(*) AS n FROM customer_login_attempts WHERE ip = ? AND attempted_at > (NOW() - INTERVAL ? MINUTE)'
        );
        $stmt->execute([$ip, HR_CUSTOMER_LOGIN_LOCKOUT_MINUTES]);
        return (int) ($stmt->fetch()['n'] ?? 0) >= HR_CUSTOMER_LOGIN_MAX_ATTEMPTS;
    } catch (Throwable $e) {
        error_log('hr_customer_login_locked_out check failed: ' . $e->getMessage());
        return false;
    }
}

function hr_record_failed_customer_login(string $ip, string $email): void
{
    try {
        $pdo = hr_db();
        $pdo->prepare('INSERT INTO customer_login_attempts (ip, email) VALUES (?, ?)')->execute([$ip, $email]);
        $pdo->prepare('DELETE FROM customer_login_attempts WHERE attempted_at < (NOW() - INTERVAL ? MINUTE)')
            ->execute([HR_CUSTOMER_LOGIN_LOCKOUT_MINUTES]);
    } catch (Throwable $e) {
        error_log('hr_record_failed_customer_login failed: ' . $e->getMessage());
    }
}

function hr_clear_failed_customer_logins(string $ip): void
{
    try {
        hr_db()->prepare('DELETE FROM customer_login_attempts WHERE ip = ?')->execute([$ip]);
    } catch (Throwable $e) {
        error_log('hr_clear_failed_customer_logins failed: ' . $e->getMessage());
    }
}
