<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

function hr_session_start(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_set_cookie_params([
            'lifetime' => 60 * 60 * 24 * 7,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
            'secure' => (($_SERVER['HTTPS'] ?? '') !== '') || (($_SERVER['SERVER_PORT'] ?? '') === '443'),
        ]);
        session_name('hr_admin_session');
        session_start();
    }
}

function hr_current_admin(): ?array
{
    hr_session_start();
    if (empty($_SESSION['admin_id'])) {
        return null;
    }
    return [
        'id' => (int) $_SESSION['admin_id'],
        'username' => (string) ($_SESSION['admin_username'] ?? ''),
        'role' => (string) ($_SESSION['admin_role'] ?? 'admin'),
    ];
}

/** Redirects to login if not authenticated. Call at the top of protected pages. */
function hr_require_admin_page(): array
{
    $admin = hr_current_admin();
    if (!$admin) {
        header('Location: /admin/login.php');
        exit;
    }
    return $admin;
}

/** For JSON API endpoints: emits 401 JSON instead of redirecting. */
function hr_require_admin_api(): array
{
    $admin = hr_current_admin();
    if (!$admin) {
        hr_json(['error' => 'Unauthorized'], 401);
    }
    return $admin;
}

const HR_LOGIN_MAX_ATTEMPTS = 8;
const HR_LOGIN_LOCKOUT_MINUTES = 15;

function hr_client_ip(): string
{
    $fwd = trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '')[0]);
    return $fwd ?: ($_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown');
}

/** True if this IP has too many recent failed logins (any username) to try again yet. */
function hr_login_locked_out(string $ip): bool
{
    try {
        $stmt = hr_db()->prepare(
            'SELECT COUNT(*) AS n FROM login_attempts WHERE ip = ? AND attempted_at > (NOW() - INTERVAL ? MINUTE)'
        );
        $stmt->execute([$ip, HR_LOGIN_LOCKOUT_MINUTES]);
        return (int) ($stmt->fetch()['n'] ?? 0) >= HR_LOGIN_MAX_ATTEMPTS;
    } catch (Throwable $e) {
        error_log('hr_login_locked_out check failed: ' . $e->getMessage());
        return false; // fail open — a DB hiccup shouldn't lock everyone out
    }
}

/** Records a failed login attempt and prunes old rows so the table can't grow unbounded. */
function hr_record_failed_login(string $ip, string $username): void
{
    try {
        $pdo = hr_db();
        $pdo->prepare('INSERT INTO login_attempts (ip, username) VALUES (?, ?)')->execute([$ip, $username]);
        $pdo->prepare('DELETE FROM login_attempts WHERE attempted_at < (NOW() - INTERVAL ? MINUTE)')
            ->execute([HR_LOGIN_LOCKOUT_MINUTES]);
    } catch (Throwable $e) {
        error_log('hr_record_failed_login failed: ' . $e->getMessage());
    }
}

/** Clears this IP's failed-attempt history after a successful login. */
function hr_clear_failed_logins(string $ip): void
{
    try {
        hr_db()->prepare('DELETE FROM login_attempts WHERE ip = ?')->execute([$ip]);
    } catch (Throwable $e) {
        error_log('hr_clear_failed_logins failed: ' . $e->getMessage());
    }
}
