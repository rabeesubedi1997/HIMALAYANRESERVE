<?php
declare(strict_types=1);
/**
 * Shared admin chrome: topbar + sidebar (desktop) / toggleable panel
 * (mobile). Include after $admin (from hr_require_admin_page()) is set,
 * and set $activeSection ('dashboard', 'media', 'inquiries', 'account', or
 * a content section key) and $pageTitle before including this file.
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
    ['key' => 'faq', 'title' => 'FAQ', 'icon' => '?'],
    ['key' => 'press', 'title' => 'Press Marquee', 'icon' => '≋'],
    ['key' => 'nav', 'title' => 'Menu', 'icon' => '☰'],
    ['key' => 'footer', 'title' => 'Footer & Contact', 'icon' => '❦'],
];

/**
 * Renders the full grouped nav link list — used for both the desktop
 * sidebar and the mobile toggle panel, so the two can never drift apart.
 * $linkClass/$groupClass let each context tweak spacing without duplicating
 * the link markup itself.
 */
function hr_render_admin_nav(string $activeSection, array $hr_sections, string $onClick = ''): void
{
    $link = function (string $href, string $key, string $icon, string $label) use ($activeSection, $onClick) {
        $active = $activeSection === $key;
        $cls = $active
            ? 'border-gold bg-gold/[0.14] text-gold'
            : 'border-transparent text-[#cfcbc2] hover:bg-white/[0.06] hover:text-paper';
        echo '<a href="' . htmlspecialchars($href) . '" ' . $onClick . ' class="flex items-center gap-3 border-l-2 px-3.5 py-2.5 text-left text-[0.72rem] font-semibold uppercase tracking-[0.12em] ' . $cls . '">'
            . '<span aria-hidden="true" class="text-sm leading-none text-gold">' . $icon . '</span>'
            . htmlspecialchars($label) . '</a>';
    };
    ?>
    <nav aria-label="Admin sections" class="flex flex-col gap-1 p-3">
      <span class="px-3.5 pb-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[#8f8a7f]">Overview</span>
      <?php $link('/admin/dashboard.php', 'dashboard', '⌂', 'Dashboard'); ?>
    </nav>
    <nav aria-label="Content sections" class="flex flex-col gap-1 border-t border-white/15 p-3 pt-4">
      <span class="px-3.5 pb-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[#8f8a7f]">Content</span>
      <?php foreach ($hr_sections as $s) { $link('/admin/index.php?section=' . $s['key'], $s['key'], $s['icon'], $s['title']); } ?>
    </nav>
    <div class="flex flex-col gap-1 border-t border-white/15 p-3 pt-4">
      <span class="px-3.5 pb-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[#8f8a7f]">Leads</span>
      <?php $link('/admin/inquiries.php', 'inquiries', '✉', 'Inquiries'); ?>
      <?php $link('/admin/chats.php', 'chats', '💬', 'Live Chat'); ?>
    </div>
    <div class="flex flex-col gap-1 border-t border-white/15 p-3 pt-4">
      <span class="px-3.5 pb-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[#8f8a7f]">Assets</span>
      <?php $link('/admin/media.php', 'media', '🖼', 'Media Library'); ?>
    </div>
    <div class="flex flex-col gap-1 border-t border-white/15 p-3 pt-4">
      <span class="px-3.5 pb-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[#8f8a7f]">Account</span>
      <?php $link('/admin/account.php', 'account', '🔒', 'Security'); ?>
    </div>
    <?php
}
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
  <link rel="stylesheet" href="<?= htmlspecialchars(hr_asset_url('assets/site.css')) ?>" />
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
      <div class="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6">
        <span class="flex items-center gap-3">
          <button
            type="button"
            id="mobileNavToggle"
            aria-label="Toggle menu"
            aria-expanded="false"
            aria-controls="mobileNavPanel"
            class="flex h-9 w-9 flex-col items-center justify-center gap-1.5 border border-white/20 md:hidden"
          >
            <span class="h-px w-4 bg-paper transition-transform duration-300"></span>
            <span class="h-px w-4 bg-paper transition-transform duration-300"></span>
            <span class="h-px w-4 bg-paper transition-transform duration-300"></span>
          </button>
          <span class="font-display text-sm font-semibold tracking-[0.28em] text-paper">
            HIMALAYAN <span class="gold-text">RESERVE</span>
            <span class="ml-2 hidden text-[0.6rem] uppercase tracking-[0.3em] text-paper-faint sm:inline">Admin</span>
          </span>
        </span>
        <span class="flex items-center gap-3 sm:gap-4">
          <span class="hidden text-xs text-paper-faint sm:inline">
            Signed in as <span class="text-paper-dim"><?= htmlspecialchars($admin['username']) ?></span>
          </span>
          <a href="/" class="hidden text-xs uppercase tracking-[0.2em] text-paper-dim transition-colors hover:text-gold sm:inline">View Site</a>
          <a href="/admin/logout.php" class="border border-white/15 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-paper-dim transition-colors hover:border-seal hover:text-seal sm:px-4">Logout</a>
        </span>
      </div>
    </header>

    <!-- Mobile toggle panel — same links as the desktop sidebar, collapsed
         by default and expanded via #mobileNavToggle (see script below). -->
    <div id="mobileNavPanel" class="hidden max-h-[70vh] flex-col overflow-y-auto border-b border-white/15 bg-[#131316] md:hidden">
      <?php hr_render_admin_nav($activeSection, $hr_sections, 'onclick="document.getElementById(\'mobileNavPanel\').classList.add(\'hidden\'); document.getElementById(\'mobileNavToggle\').setAttribute(\'aria-expanded\',\'false\')"'); ?>
    </div>
    <script>
      document.getElementById('mobileNavToggle').addEventListener('click', function () {
        var panel = document.getElementById('mobileNavPanel');
        var open = panel.classList.toggle('hidden') === false;
        this.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    </script>

    <div class="flex min-h-0 flex-1">
      <aside class="hidden w-60 shrink-0 flex-col overflow-y-auto border-r border-white/15 bg-[#131316] md:flex">
        <?php hr_render_admin_nav($activeSection, $hr_sections); ?>
      </aside>

      <div class="flex min-w-0 flex-1">
