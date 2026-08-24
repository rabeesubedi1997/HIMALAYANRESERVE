<?php
declare(strict_types=1);

require_once __DIR__ . '/../auth.php';

hr_require_admin_api();

$validStatuses = ['new', 'contacted', 'allocated', 'declined'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $status = $_GET['status'] ?? '';
    $pdo = hr_db();
    if (in_array($status, $validStatuses, true)) {
        $stmt = $pdo->prepare('SELECT * FROM allocations WHERE status = ? ORDER BY created_at DESC LIMIT 500');
        $stmt->execute([$status]);
    } else {
        $stmt = $pdo->query('SELECT * FROM allocations ORDER BY created_at DESC LIMIT 500');
    }
    $counts = $pdo->query('SELECT status, COUNT(*) AS n FROM allocations GROUP BY status')->fetchAll();
    hr_json(['inquiries' => $stmt->fetchAll(), 'counts' => $counts]);
}

if ($method === 'PATCH') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id = (int) ($body['id'] ?? 0);
    $status = (string) ($body['status'] ?? '');
    if ($id <= 0 || !in_array($status, $validStatuses, true)) {
        hr_json(['error' => 'Invalid id or status.'], 422);
    }
    hr_db()->prepare('UPDATE allocations SET status = ? WHERE id = ?')->execute([$status, $id]);
    hr_json(['ok' => true]);
}

if ($method === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    if ($id <= 0) {
        hr_json(['error' => 'Invalid id.'], 422);
    }
    hr_db()->prepare('DELETE FROM allocations WHERE id = ?')->execute([$id]);
    hr_json(['ok' => true]);
}

hr_json(['error' => 'Method not allowed.'], 405);
