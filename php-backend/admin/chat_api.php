<?php
declare(strict_types=1);

require_once __DIR__ . '/../auth.php';

hr_require_admin_api();
$pdo = hr_db();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET' && isset($_GET['id'])) {
    $id = (int) $_GET['id'];
    $stmt = $pdo->prepare(
        'SELECT c.*, cu.name AS customer_name, cu.email AS customer_email
         FROM conversations c JOIN customers cu ON cu.id = c.customer_id
         WHERE c.id = ? LIMIT 1'
    );
    $stmt->execute([$id]);
    $conv = $stmt->fetch();
    if (!$conv) {
        hr_json(['error' => 'Conversation not found.'], 404);
    }
    // Admin is viewing this thread now — clear their unread counter.
    $pdo->prepare('UPDATE conversations SET admin_unread = 0 WHERE id = ?')->execute([$id]);

    $since = (int) ($_GET['since_id'] ?? 0);
    if ($since > 0) {
        $msgStmt = $pdo->prepare('SELECT id, sender, body, created_at FROM messages WHERE conversation_id = ? AND id > ? ORDER BY id ASC');
        $msgStmt->execute([$id, $since]);
    } else {
        $msgStmt = $pdo->prepare('SELECT id, sender, body, created_at FROM messages WHERE conversation_id = ? ORDER BY id ASC LIMIT 500');
        $msgStmt->execute([$id]);
    }
    hr_json(['conversation' => $conv, 'messages' => $msgStmt->fetchAll()]);
}

if ($method === 'GET') {
    $rows = $pdo->query(
        "SELECT c.id, c.status, c.last_message_at, c.admin_unread, cu.name AS customer_name, cu.email AS customer_email,
                (SELECT body FROM messages m WHERE m.conversation_id = c.id ORDER BY m.id DESC LIMIT 1) AS last_message
         FROM conversations c JOIN customers cu ON cu.id = c.customer_id
         ORDER BY c.last_message_at DESC LIMIT 200"
    )->fetchAll();
    hr_json(['conversations' => $rows]);
}

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id = (int) ($body['id'] ?? 0);
    $text = trim((string) ($body['body'] ?? ''));
    if ($id <= 0 || $text === '' || mb_strlen($text) > 4000) {
        hr_json(['error' => 'Invalid conversation id or message.'], 422);
    }

    $exists = $pdo->prepare('SELECT id FROM conversations WHERE id = ? LIMIT 1');
    $exists->execute([$id]);
    if (!$exists->fetch()) {
        hr_json(['error' => 'Conversation not found.'], 404);
    }

    $pdo->prepare('INSERT INTO messages (conversation_id, sender, body) VALUES (?, \'admin\', ?)')->execute([$id, $text]);
    $newId = (int) $pdo->lastInsertId();
    $pdo->prepare('UPDATE conversations SET last_message_at = NOW(), customer_unread = customer_unread + 1 WHERE id = ?')->execute([$id]);

    hr_json(['ok' => true, 'id' => $newId], 201);
}

if ($method === 'PATCH') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id = (int) ($body['id'] ?? 0);
    $status = (string) ($body['status'] ?? '');
    if ($id <= 0 || !in_array($status, ['open', 'closed'], true)) {
        hr_json(['error' => 'Invalid id or status.'], 422);
    }
    $pdo->prepare('UPDATE conversations SET status = ? WHERE id = ?')->execute([$status, $id]);
    hr_json(['ok' => true]);
}

hr_json(['error' => 'Method not allowed.'], 405);
