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
