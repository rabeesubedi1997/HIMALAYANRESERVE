<?php
declare(strict_types=1);

require_once __DIR__ . '/../auth.php';

hr_session_start();
if (hr_current_admin()) {
    header('Location: /admin/dashboard.php');
    exit;
}

$error = '';
$ip = hr_client_ip();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim((string) ($_POST['username'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');

    if (hr_login_locked_out($ip)) {
        $error = 'Too many failed attempts. Please try again in ' . HR_LOGIN_LOCKOUT_MINUTES . ' minutes.';
    } elseif ($username === '' || $password === '') {
        $error = 'Please enter a username and password.';
    } else {
        try {
            $stmt = hr_db()->prepare('SELECT id, username, password_hash, role FROM users WHERE username = ? LIMIT 1');
            $stmt->execute([$username]);
            $user = $stmt->fetch();

            // Constant-time-ish: always run password_verify even if user not found.
            $hash = $user['password_hash'] ?? '$2y$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva';
            $ok = password_verify($password, $hash);

            if ($user && $ok) {
                hr_clear_failed_logins($ip);
                session_regenerate_id(true);
                $_SESSION['admin_id'] = (int) $user['id'];
                $_SESSION['admin_username'] = $user['username'];
                $_SESSION['admin_role'] = $user['role'];
                header('Location: /admin/dashboard.php');
                exit;
            }
            hr_record_failed_login($ip, $username);
            $error = 'Invalid username or password.';
        } catch (Throwable $e) {
            error_log('admin login failed: ' . $e->getMessage());
            $error = 'Login temporarily unavailable.';
        }
    }
}
?>
<!doctype html>
<html lang="en" class="h-full">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Admin Login — Himalayan Reserve</title>
  <meta name="robots" content="noindex, nofollow" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400..800&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0; min-height: 100svh; display: flex; align-items: center; justify-content: center;
      background: #0b0b0b; color: #fff; font-family: Montserrat, ui-sans-serif, system-ui, sans-serif; padding: 24px;
    }
    form {
      width: 100%; max-width: 380px; display: flex; flex-direction: column; gap: 20px;
      border: 1px solid rgba(255,255,255,.25); background: #19191d; padding: 32px; border-radius: 2px;
    }
    .brand { font-family: "Playfair Display", serif; font-weight: 600; letter-spacing: .32em; font-size: 1.5rem; }
    .gold { color: #d4af37; }
    label { display: flex; flex-direction: column; gap: 8px; font-size: .78rem; }
    label span { text-transform: uppercase; letter-spacing: .24em; font-size: .65rem; color: #d4af37; }
    input {
      width: 100%; border: 1px solid rgba(255,255,255,.3); background: #1c1c1c; color: #fff;
      padding: 14px 16px; font-size: .9rem; border-radius: 0;
    }
    input:focus { outline: none; border-color: #d4af37; box-shadow: 0 0 0 2px rgba(212,175,55,.25); }
    .error { color: #d98a8e; font-size: .85rem; margin: 0; }
    button {
      background: #d4af37; color: #0b0b0b; border: none; padding: 14px; font-size: .72rem;
      font-weight: 500; letter-spacing: .24em; text-transform: uppercase; cursor: pointer;
    }
    button:hover { background: #fff; }
    .back { text-align: center; font-size: .8rem; color: #6e6a60; text-decoration: none; }
    .back:hover { color: #d4af37; }
  </style>
</head>
<body>
  <form method="post" novalidate>
    <div>
      <div class="brand">HIMALAYAN <span class="gold">RESERVE</span></div>
      <div style="font-size:.7rem;letter-spacing:.28em;text-transform:uppercase;color:#6e6a60;margin-top:6px;">Admin Console</div>
    </div>
    <label><span>Username</span><input type="text" name="username" autocomplete="username" required /></label>
    <label><span>Password</span><input type="password" name="password" autocomplete="current-password" required /></label>
    <?php if ($error): ?><p class="error"><?= htmlspecialchars($error) ?></p><?php endif; ?>
    <button type="submit">Sign In</button>
    <a class="back" href="/">← Back to site</a>
  </form>
</body>
</html>
