<?php
declare(strict_types=1);

require_once __DIR__ . '/settings.php';

/**
 * Emails the site's contact address (Footer & Contact → Email, editable in
 * admin) the moment a new Private Allocation inquiry comes in. Uses PHP's
 * built-in mail() — cPanel/shared hosting normally has a local MTA wired up
 * for this with no SMTP setup needed. Never throws: a mail failure should
 * never take down the actual form submission.
 */
function hr_notify_new_allocation(array $data): void
{
    try {
        $settings = hr_get_settings();
        $to = trim((string) ($settings['footer']['email'] ?? ''));
        if ($to === '' || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
            return;
        }

        $typeLabel = $data['inquiryType'];
        foreach (HR_INQUIRY_TYPES as $t) {
            if ($t['value'] === $data['inquiryType']) {
                $typeLabel = $t['label'];
                break;
            }
        }

        $siteUrl = rtrim(hr_env('SITE_URL', 'https://himalayanreserve.kitetool.com'), '/');
        $host = parse_url($siteUrl, PHP_URL_HOST) ?: 'localhost';

        $subject = 'New Private Allocation Inquiry — ' . $data['fullName'];
        $lines = [
            'A new inquiry was submitted on the Himalayan Reserve site.',
            '',
            'Name: ' . $data['fullName'],
            'Email: ' . $data['email'],
            'Phone/WhatsApp: ' . $data['phone'],
            'Country/City: ' . $data['countryCity'],
            'Inquiry Type: ' . $typeLabel,
            'Channel: ' . $data['channel'],
        ];
        if (!empty($data['message'])) {
            $lines[] = '';
            $lines[] = 'Message:';
            $lines[] = $data['message'];
        }
        $lines[] = '';
        $lines[] = 'View & manage: ' . $siteUrl . '/admin/inquiries.php';

        $headers = "From: Himalayan Reserve Site <no-reply@$host>\r\n"
            . 'Reply-To: ' . $data['email'] . "\r\n"
            . "Content-Type: text/plain; charset=UTF-8";

        @mail($to, $subject, implode("\n", $lines), $headers);
    } catch (Throwable $e) {
        error_log('hr_notify_new_allocation failed: ' . $e->getMessage());
    }
}
