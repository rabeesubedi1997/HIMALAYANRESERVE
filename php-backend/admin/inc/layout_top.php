<?php
declare(strict_types=1);
/**
 * Shared admin chrome: topbar + sidebar. Include after $admin (from
 * hr_require_admin_page()) is set, and set $activeSection ('media' for
 * the media library page, or a section key for the content editor) and
 * $pageTitle before including this file.
 */

$hr_sections = [
    ['key' => 'seo', 'title' => 'SEO & Meta', 'icon' => '◎'],
    ['key' => 'hero', 'title' => 'Hero Section', 'icon' => '✦'],
    ['key' => 'stats', 'title' => 'Stats Strip', 'icon' => '▤'],
    ['key' => 'ancestral', 'title' => 'Ancestral Collection', 'icon' => '❖'],
    ['key' => 'civet', 'title' => 'Wild Civet Collection', 'icon' => '👑'],
    ['key' => 'craft', 'title' => 'Ancestral Craft', 'icon' => '❂'],
    ['key' => 'packaging', 'title' => 'Eco Packaging', 'icon' => '▣'],
    ['key' => 'dubai', 'title' => 'Dubai Destination', 'icon' => '◈'],
    ['key' => 'press', 'title' => 'Press Marquee', 'icon' => '≋'],
    ['key' => 'nav', 'title' => 'Menu', 'icon' => '☰'],
    ['key' => 'footer', 'title' => 'Footer & Contact', 'icon' => '❦'],
    ['key' => 'media', 'title' => 'Images & Video', 'icon' => '🖼'],
];
?>
<!doctype html>
<html lang="en" class="h-full">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title><?= htmlspecialchars($pageTitle ?? 'Admin') ?> — Himalayan Reserve</title>
  <meta name="robots" content="noindex, nofollow" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400..800&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/assets/site.css" />
  <style>
    :root { color-scheme: dark; }
    html, body { height: 100%; margin: 0; }
    body { display: flex; flex-direction: column; background: #0b0b0b; }
    a { color: inherit; }
  </style>
</head>
<body class="text-paper">
  <div class="flex h-screen flex-col bg-ink text-paper">
    <header class="z-20 border-b hairline-gold bg-ink/95 backdrop-blur">
      <div class="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between px-6">
        <span class="font-display text-sm font-semibold tracking-[0.28em] text-paper">
          HIMALAYAN <span class="gold-text">RESERVE</span>
          <span class="ml-2 text-[0.6rem] uppercase tracking-[0.3em] text-paper-faint">Admin</span>
        </span>
        <span class="flex items-center gap-4">
          <span class="hidden text-xs text-paper-faint sm:inline">
            Signed in as <span class="text-paper-dim"><?= htmlspecialchars($admin['username']) ?></span>
          </span>
          <a href="/" class="text-xs uppercase tracking-[0.2em] text-paper-dim transition-colors hover:text-gold">View Site</a>
          <a href="/admin/logout.php" class="border border-white/15 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-paper-dim transition-colors hover:border-seal hover:text-seal">Logout</a>
        </span>
      </div>
    </header>

    <div class="flex min-h-0 flex-1 flex-col">
      <div class="flex gap-2 overflow-x-auto border-b border-white/15 bg-[#151518] px-4 py-3 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <?php foreach ($hr_sections as $s): $href = $s['key'] === 'media' ? '/admin/media.php' : "/admin/index.php?section={$s['key']}"; ?>
          <a href="<?= $href ?>" class="shrink-0 whitespace-nowrap border px-3 py-1.5 text-[0.64rem] font-semibold uppercase tracking-[0.12em] <?= $activeSection === $s['key'] ? 'border-gold/80 bg-gold/15 text-gold' : 'border-white/25 text-[#cfcbc2]' ?>">
            <?= htmlspecialchars($s['title']) ?>
          </a>
        <?php endforeach; ?>
      </div>

      <div class="flex min-h-0 flex-1">
        <aside class="hidden w-60 shrink-0 flex-col overflow-y-auto border-r border-white/15 bg-[#131316] md:flex">
          <nav aria-label="Admin sections" class="flex flex-col gap-1 p-3">
            <span class="px-3.5 pb-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[#8f8a7f]">Content</span>
            <?php foreach ($hr_sections as $s): if ($s['key'] === 'media') continue; ?>
              <a
                href="/admin/index.php?section=<?= $s['key'] ?>"
                class="flex items-center gap-3 border-l-2 px-3.5 py-2.5 text-left text-[0.72rem] font-semibold uppercase tracking-[0.12em] <?= $activeSection === $s['key'] ? 'border-gold bg-gold/[0.14] text-gold' : 'border-transparent text-[#cfcbc2] hover:bg-white/[0.06] hover:text-paper' ?>"
              >
                <span aria-hidden="true" class="text-sm leading-none text-gold"><?= $s['icon'] ?></span>
                <?= htmlspecialchars($s['title']) ?>
              </a>
            <?php endforeach; ?>
          </nav>
          <div class="mt-4 flex flex-col gap-1 border-t border-white/15 p-3 pt-4">
            <span class="px-3.5 pb-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[#8f8a7f]">Assets</span>
            <a
              href="/admin/media.php"
              class="flex items-center gap-3 border-l-2 px-3.5 py-2.5 text-left text-[0.72rem] font-semibold uppercase tracking-[0.12em] <?= $activeSection === 'media' ? 'border-gold bg-gold/[0.14] text-gold' : 'border-transparent text-[#cfcbc2] hover:bg-white/[0.06] hover:text-paper' ?>"
            >
              <span aria-hidden="true" class="text-sm leading-none text-gold">🖼</span>
              Media Library
            </a>
          </div>
        </aside>

        <div class="flex min-w-0 flex-1">
