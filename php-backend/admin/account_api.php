<?php
declare(strict_types=1);

require_once __DIR__ . '/../auth.php';

$admin = hr_require_admin_api();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    hr_json(['error' => 'Method not allowed.'], 405);
}

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) {
    hr_json(['error' => 'Invalid JSON body.'], 400);
}

$current = (string) ($body['currentPassword'] ?? '');
$new = (string) ($body['newPassword'] ?? '');

if ($current === '' || $new === '') {
    hr_json(['error' => 'Current and new password are required.'], 422);
}
if (strlen($new) < 10) {
    hr_json(['error' => 'New password must be at least 10 characters.'], 422);
}

try {
    $pdo = hr_db();
    $stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$admin['id']]);
    $row = $stmt->fetch();

    if (!$row || !password_verify($current, $row['password_hash'])) {
        hr_json(['error' => 'Current password is incorrect.'], 403);
    }

    $hash = password_hash($new, PASSWORD_BCRYPT);
    $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([$hash, $admin['id']]);

    hr_json(['ok' => true]);
} catch (Throwable $e) {
    error_log('account_api password update failed: ' . $e->getMessage());
    hr_json(['error' => 'Failed to update password.'], 500);
}
