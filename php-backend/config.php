<?php
/**
 * Shared config: loads .env (same file already used by the old Next.js
 * deploy — DB creds are reused as-is) and exposes a PDO connection.
 */

declare(strict_types=1);

// Don't rely on the shared host's php.ini default for this — leaking a
// stack trace (file paths, SQL, etc.) on an uncaught error is a real
// information-disclosure risk. Errors still get logged, just not echoed.
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

function hr_load_env(string $path): void
{
    if (!is_file($path)) {
        return;
    }
    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') {
            continue;
        }
        $eq = strpos($line, '=');
        if ($eq === false) {
            continue;
        }
        $key = trim(substr($line, 0, $eq));
        $value = trim(substr($line, $eq + 1));
        if (
            (str_starts_with($value, '"') && str_ends_with($value, '"')) ||
            (str_starts_with($value, "'") && str_ends_with($value, "'"))
        ) {
            $value = substr($value, 1, -1);
        }
        if (getenv($key) === false) {
            putenv("$key=$value");
        }
    }
}

hr_load_env(__DIR__ . '/.env');

function hr_env(string $key, string $default = ''): string
{
    $value = getenv($key);
    return $value === false ? $default : $value;
}

function hr_db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = hr_env('DB_HOST', '127.0.0.1');
    $port = hr_env('DB_PORT', '3306');
    $name = hr_env('DB_NAME', 'himalayan_reserve');
    $user = hr_env('DB_USER', 'root');
    $pass = hr_env('DB_PASSWORD', '');

    $dsn = "mysql:host=$host;port=$port;dbname=$name;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}

function hr_json(array $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function hr_uploads_dir(): string
{
    return __DIR__ . '/uploads';
}

/**
 * URL for a file under /assets, with a cache-busting ?v= query string based
 * on the file's mtime. assets/site.css and site.js keep the same filename
 * across every deploy (so deploy.sh can ship a pre-built dist/ without
 * needing Node on the server) and .htaccess caches them for a year — without
 * this, a browser that visited before a fix shipped would keep serving the
 * old cached copy for up to a year after redeploying.
 */
function hr_asset_url(string $relativePath): string
{
    $file = __DIR__ . '/' . ltrim($relativePath, '/');
    $version = is_file($file) ? filemtime($file) : time();
    return '/' . ltrim($relativePath, '/') . '?v=' . $version;
}
