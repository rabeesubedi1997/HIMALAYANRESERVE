<?php
declare(strict_types=1);

require_once __DIR__ . '/../inc/customer_auth.php';
require_once __DIR__ . '/../inc/notify.php';

$customer = hr_require_customer_api();
$pdo = hr_db();

function hr_get_or_create_conversation(PDO $pdo, int $customerId): array
{
    $stmt = $pdo->prepare('SELECT * FROM conversations WHERE customer_id = ? LIMIT 1');
    $stmt->execute([$customerId]);
    $conv = $stmt->fetch();
    if ($conv) {
        return $conv;
    }
    $pdo->prepare('INSERT INTO conversations (customer_id) VALUES (?)')->execute([$customerId]);
    $id = (int) $pdo->lastInsertId();
    $stmt = $pdo->prepare('SELECT * FROM conversations WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    return $stmt->fetch();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $conv = hr_get_or_create_conversation($pdo, $customer['id']);
        // Opening/polling the thread means the customer has now seen
        // whatever the admin sent — clear their unread counter.
        $pdo->prepare('UPDATE conversations SET customer_unread = 0 WHERE id = ?')->execute([$conv['id']]);

        $since = (int) ($_GET['since_id'] ?? 0);
        if ($since > 0) {
            $stmt = $pdo->prepare('SELECT id, sender, body, created_at FROM messages WHERE conversation_id = ? AND id > ? ORDER BY id ASC');
            $stmt->execute([$conv['id'], $since]);
        } else {
            $stmt = $pdo->prepare('SELECT id, sender, body, created_at FROM messages WHERE conversation_id = ? ORDER BY id ASC LIMIT 200');
            $stmt->execute([$conv['id']]);
        }
        hr_json(['messages' => $stmt->fetchAll(), 'status' => $conv['status']]);
    } catch (Throwable $e) {
        error_log('chat GET failed: ' . $e->getMessage());
        hr_json(['error' => 'Unable to load chat.'], 500);
    }
}

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $text = trim((string) ($body['body'] ?? ''));
    if ($text === '' || mb_strlen($text) > 4000) {
        hr_json(['error' => 'Message must be between 1 and 4000 characters.'], 422);
    }

    try {
        $conv = hr_get_or_create_conversation($pdo, $customer['id']);
        $pdo->prepare('INSERT INTO messages (conversation_id, sender, body) VALUES (?, \'customer\', ?)')->execute([$conv['id'], $text]);
        $newId = (int) $pdo->lastInsertId();
        $pdo->prepare('UPDATE conversations SET last_message_at = NOW(), admin_unread = admin_unread + 1, status = \'open\' WHERE id = ?')->execute([$conv['id']]);

        hr_notify_new_chat_message($customer['name'], $customer['email'], $text);

        hr_json(['ok' => true, 'id' => $newId], 201);
    } catch (Throwable $e) {
        error_log('chat POST failed: ' . $e->getMessage());
        hr_json(['error' => 'Unable to send message.'], 500);
    }
}

hr_json(['error' => 'Method not allowed.'], 405);
