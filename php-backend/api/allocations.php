<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    hr_json(['error' => 'Method not allowed.'], 405);
}

$raw = file_get_contents('php://input');
$body = json_decode($raw, true);
if (!is_array($body)) {
    hr_json(['error' => 'Invalid JSON body.'], 400);
}

function hr_str(mixed $v): string
{
    return trim(is_string($v) ? $v : '');
}

$fullName = hr_str($body['fullName'] ?? '');
$email = strtolower(hr_str($body['email'] ?? ''));
$phone = hr_str($body['phone'] ?? '');
$countryCity = hr_str($body['countryCity'] ?? '');
$inquiryType = hr_str($body['inquiryType'] ?? '');
$message = hr_str($body['message'] ?? '');
$channel = hr_str($body['channel'] ?? 'form');

$validInquiryTypes = ['private_collection', 'royal_gifting', 'atmosphere_reservation'];
$validChannels = ['form', 'whatsapp', 'mailto'];

if (mb_strlen($fullName) < 2 || mb_strlen($fullName) > 120) {
    hr_json(['error' => 'Please enter your full name'], 422);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 190) {
    hr_json(['error' => 'Please enter a valid email address'], 422);
}
if (mb_strlen($phone) < 6 || mb_strlen($phone) > 60) {
    hr_json(['error' => 'Please enter a valid phone / WhatsApp number'], 422);
}
if (mb_strlen($countryCity) < 2 || mb_strlen($countryCity) > 120) {
    hr_json(['error' => 'Please enter country / city'], 422);
}
if (!in_array($inquiryType, $validInquiryTypes, true)) {
    hr_json(['error' => 'Please select an inquiry type'], 422);
}
if (!in_array($channel, $validChannels, true)) {
    $channel = 'form';
}
$message = mb_substr($message, 0, 2000);

$ip = trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '')[0])
    ?: ($_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? null);
$userAgent = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255) ?: null;

try {
    $pdo = hr_db();

    $dup = $pdo->prepare(
        'SELECT id FROM allocations WHERE email = ? AND phone = ? AND created_at > (NOW() - INTERVAL 10 MINUTE) LIMIT 1'
    );
    $dup->execute([$email, $phone]);
    if ($dup->fetch()) {
        hr_json(['error' => 'This inquiry was already submitted. Our allocation desk will contact you.'], 409);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO allocations (full_name, email, phone, country_city, inquiry_type, message, channel, ip, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([$fullName, $email, $phone, $countryCity, $inquiryType, $message ?: null, $channel, $ip, $userAgent]);

    hr_json(['ok' => true, 'id' => (int) $pdo->lastInsertId()], 201);
} catch (Throwable $e) {
    error_log('allocations POST failed: ' . $e->getMessage());
    hr_json(['error' => 'Unable to store inquiry. Please try again.'], 500);
}
