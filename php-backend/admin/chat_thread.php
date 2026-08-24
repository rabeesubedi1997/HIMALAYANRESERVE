<?php
declare(strict_types=1);

require_once __DIR__ . '/../auth.php';

$admin = hr_require_admin_page();
$activeSection = 'chats';
$convId = (int) ($_GET['id'] ?? 0);
if ($convId <= 0) {
    header('Location: /admin/chats.php');
    exit;
}
$pageTitle = 'Chat';
require __DIR__ . '/inc/layout_top.php';
?>
    <main class="flex min-h-0 w-full flex-1 flex-col">
      <div class="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/15 bg-[#0f0f12]/95 px-6 py-4 backdrop-blur">
        <div>
          <a href="/admin/chats.php" class="text-xs uppercase tracking-[0.2em] text-paper-dim hover:text-gold">← All Chats</a>
          <h1 id="thread-title" class="font-display text-xl font-medium leading-tight text-paper">Loading…</h1>
        </div>
        <button type="button" id="closeToggleBtn" class="border border-white/20 px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-paper-dim hover:border-gold hover:text-gold"></button>
      </div>

      <div id="thread-messages" class="flex flex-1 flex-col gap-3 overflow-y-auto px-6 py-6"></div>

      <form id="replyForm" class="flex items-end gap-3 border-t border-white/15 bg-[#0f0f12]/95 p-4">
        <textarea id="replyBody" rows="1" placeholder="Type a reply…" class="min-h-[44px] flex-1 resize-none border border-white/20 bg-[#1c1c1c] px-4 py-3 text-sm text-paper outline-none focus:border-gold"></textarea>
        <button type="submit" class="bg-gold px-6 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-ink hover:bg-white">Send</button>
      </form>
    </main>
<?php
require __DIR__ . '/inc/layout_bottom.php';
?>
<script>window.HR_CONVERSATION_ID = <?= json_encode($convId) ?>;</script>
<script src="<?= htmlspecialchars(hr_asset_url('assets/admin-chat-thread.js')) ?>"></script>
