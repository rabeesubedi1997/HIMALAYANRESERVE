<?php
declare(strict_types=1);

require_once __DIR__ . '/../auth.php';

$admin = hr_require_admin_page();
$activeSection = 'chats';
$pageTitle = 'Live Chat';
require __DIR__ . '/inc/layout_top.php';
?>
    <main class="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">
      <div class="sticky top-0 z-10 border-b border-white/15 bg-[#0f0f12]/95 px-6 py-5 backdrop-blur">
        <p class="mb-1 text-[0.62rem] font-medium uppercase tracking-[0.24em] text-gold">Leads</p>
        <h1 class="font-display text-2xl font-medium leading-tight text-paper md:text-3xl">Live Chat</h1>
      </div>
      <div class="flex-1 px-6 py-6">
        <p id="chats-empty" class="hidden text-sm text-paper-dim">No conversations yet.</p>
        <div id="chats-list" class="flex flex-col gap-2"></div>
      </div>
    </main>
<?php
require __DIR__ . '/inc/layout_bottom.php';
?>
<script src="<?= htmlspecialchars(hr_asset_url('assets/admin-chats.js')) ?>"></script>
