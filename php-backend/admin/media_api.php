<?php
declare(strict_types=1);

require_once __DIR__ . '/../auth.php';

hr_require_admin_api();

$dir = hr_uploads_dir();
if (!is_dir($dir)) {
    mkdir($dir, 0755, true);
}

$imageExt = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg'];
$videoExt = ['mp4', 'webm', 'mov'];

function hr_classify(string $name, array $imageExt, array $videoExt): string
{
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    if (in_array($ext, $imageExt, true)) return 'image';
    if (in_array($ext, $videoExt, true)) return 'video';
    return 'file';
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $files = [];
    foreach (scandir($dir) ?: [] as $name) {
        if ($name === '.' || $name === '..' || str_starts_with($name, '.')) {
            continue;
        }
        $full = $dir . '/' . $name;
        if (!is_file($full)) {
            continue;
        }
        $files[] = [
            'name' => $name,
            'url' => '/uploads/' . $name,
            'size' => filesize($full),
            'type' => hr_classify($name, $imageExt, $videoExt),
            'modified' => date('c', filemtime($full)),
        ];
    }
    usort($files, fn($a, $b) => strcmp($b['modified'], $a['modified']));
    hr_json(['media' => $files]);
}

if ($method === 'POST') {
    if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        hr_json(['error' => 'No file uploaded, or upload error.'], 422);
    }
    $file = $_FILES['file'];
    $maxBytes = 30 * 1024 * 1024;
    if ($file['size'] > $maxBytes) {
        hr_json(['error' => 'File too large (max 30MB).'], 422);
    }
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, [...$imageExt, ...$videoExt], true)) {
        hr_json(['error' => 'Unsupported file type.'], 422);
    }
    $safeBase = preg_replace('/[^a-zA-Z0-9_-]/', '-', pathinfo($file['name'], PATHINFO_FILENAME));
    $filename = time() . '-' . substr(bin2hex(random_bytes(4)), 0, 8) . '-' . $safeBase . '.' . $ext;
    $dest = $dir . '/' . $filename;
    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        hr_json(['error' => 'Failed to save file.'], 500);
    }
    hr_json(['ok' => true, 'url' => '/uploads/' . $filename]);
}

if ($method === 'DELETE') {
    parse_str(file_get_contents('php://input'), $body);
    $url = $_GET['url'] ?? ($body['url'] ?? '');
    if (!$url || !str_starts_with($url, '/uploads/')) {
        hr_json(['error' => 'Invalid media url.'], 422);
    }
    $name = basename($url);
    if ($name === '' || str_contains($name, '..')) {
        hr_json(['error' => 'Invalid media name.'], 422);
    }
    $target = $dir . '/' . $name;
    if (is_file($target)) {
        unlink($target);
    }
    hr_json(['ok' => true]);
}

hr_json(['error' => 'Method not allowed.'], 405);
