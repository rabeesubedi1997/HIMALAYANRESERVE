<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../inc/notify.php';

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

// Honeypot: the form has a hidden "website" field real visitors never see or
// fill; the client JS already skips submitting when it's filled, but bots
// that POST straight to this endpoint skip the browser entirely, so the
// check has to be enforced here too. Pretend success — telling a bot it
// was rejected only teaches it to leave the field empty next time.
if (hr_str($body['website'] ?? '') !== '') {
    hr_json(['ok' => true, 'id' => 0], 201);
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

    // Per-IP rate limit — a handful of genuine inquiries per hour is normal,
    // dozens is scripted spam. Checked before the duplicate check so a
    // flood from one IP can't hide behind varying emails/phones.
    if ($ip) {
        $rate = $pdo->prepare(
            'SELECT COUNT(*) AS n FROM allocations WHERE ip = ? AND created_at > (NOW() - INTERVAL 1 HOUR)'
        );
        $rate->execute([$ip]);
        if ((int) ($rate->fetch()['n'] ?? 0) >= 8) {
            hr_json(['error' => 'Too many requests. Please try again later.'], 429);
        }
    }

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
    // Capture this immediately — hr_notify_new_allocation() below runs its
    // own queries on the same connection, and lastInsertId() must not be
    // read after anything else has touched it.
    $newId = (int) $pdo->lastInsertId();

    hr_notify_new_allocation([
        'fullName' => $fullName, 'email' => $email, 'phone' => $phone, 'countryCity' => $countryCity,
        'inquiryType' => $inquiryType, 'message' => $message, 'channel' => $channel,
    ]);

    hr_json(['ok' => true, 'id' => $newId], 201);
} catch (Throwable $e) {
    error_log('allocations POST failed: ' . $e->getMessage());
    hr_json(['error' => 'Unable to store inquiry. Please try again.'], 500);
}
