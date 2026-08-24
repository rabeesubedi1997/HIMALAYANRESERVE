<?php
declare(strict_types=1);

require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../inc/settings.php';

hr_require_admin_api();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    hr_json(['settings' => hr_get_settings()]);
}

if ($method === 'PUT') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body) || array_is_list($body)) {
        hr_json(['error' => 'Expected an object of section updates.'], 422);
    }

    $updates = [];
    foreach ($body as $key => $value) {
        if (!hr_is_section_key((string) $key)) {
            continue;
        }
        $clean = hr_sanitize_section_value($value);
        if ($clean !== null) {
            $updates[$key] = $clean;
        }
    }

    if (!$updates) {
        hr_json(['error' => 'No valid sections provided.'], 422);
    }

    try {
        $pdo = hr_db();
        $stmt = $pdo->prepare(
            'INSERT INTO site_settings (setting_key, settings) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE settings = VALUES(settings)'
        );
        foreach ($updates as $key => $value) {
            $stmt->execute([$key, json_encode($value)]);
        }
        hr_json(['ok' => true, 'settings' => hr_get_settings()]);
    } catch (Throwable $e) {
        error_log('admin settings PUT failed: ' . $e->getMessage());
        hr_json(['error' => 'Failed to save settings.'], 500);
    }
}

hr_json(['error' => 'Method not allowed.'], 405);
