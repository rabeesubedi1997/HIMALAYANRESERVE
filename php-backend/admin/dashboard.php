<?php
declare(strict_types=1);

require_once __DIR__ . '/../auth.php';

$admin = hr_require_admin_page();
$activeSection = 'dashboard';
$pageTitle = 'Dashboard';

$counts = ['new' => 0, 'contacted' => 0, 'allocated' => 0, 'declined' => 0];
$recent = [];
try {
    $pdo = hr_db();
    foreach ($pdo->query('SELECT status, COUNT(*) AS n FROM allocations GROUP BY status')->fetchAll() as $row) {
        $counts[$row['status']] = (int) $row['n'];
    }
    $recent = $pdo->query('SELECT id, full_name, email, inquiry_type, status, created_at FROM allocations ORDER BY created_at DESC LIMIT 6')->fetchAll();
} catch (Throwable $e) {
    error_log('dashboard query failed: ' . $e->getMessage());
}
$total = array_sum($counts);

function hd(string $v): string { return htmlspecialchars($v, ENT_QUOTES); }

$TYPE_LABELS = [
    'private_collection' => 'Private Collection',
    'royal_gifting' => 'Royal Gifting',
    'atmosphere_reservation' => 'At.mosphere Reservation',
];

require __DIR__ . '/inc/layout_top.php';
?>
    <main class="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">
      <div class="sticky top-0 z-10 border-b border-white/15 bg-[#0f0f12]/95 px-6 py-5 backdrop-blur">
        <p class="mb-1 text-[0.62rem] font-medium uppercase tracking-[0.24em] text-gold">Welcome back</p>
        <h1 class="font-display text-2xl font-medium leading-tight text-paper md:text-3xl"><?= hd($admin['username']) ?></h1>
      </div>

      <div class="flex-1 px-6 py-6">
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <a href="/admin/inquiries.php" class="border border-white/10 bg-ink/70 p-5 transition-colors hover:border-gold/40">
            <span class="block font-display text-3xl text-paper"><?= $total ?></span>
            <span class="mt-1 block text-xs uppercase tracking-[0.16em] text-paper-dim">Total Inquiries</span>
          </a>
          <a href="/admin/inquiries.php?status=new" class="border border-white/10 bg-ink/70 p-5 transition-colors hover:border-gold/40">
            <span class="block font-display text-3xl text-gold"><?= $counts['new'] ?></span>
            <span class="mt-1 block text-xs uppercase tracking-[0.16em] text-paper-dim">New</span>
          </a>
          <a href="/admin/inquiries.php?status=contacted" class="border border-white/10 bg-ink/70 p-5 transition-colors hover:border-gold/40">
            <span class="block font-display text-3xl text-paper"><?= $counts['contacted'] ?></span>
            <span class="mt-1 block text-xs uppercase tracking-[0.16em] text-paper-dim">Contacted</span>
          </a>
          <a href="/admin/inquiries.php?status=allocated" class="border border-white/10 bg-ink/70 p-5 transition-colors hover:border-gold/40">
            <span class="block font-display text-3xl text-paper"><?= $counts['allocated'] ?></span>
            <span class="mt-1 block text-xs uppercase tracking-[0.16em] text-paper-dim">Allocated</span>
          </a>
        </div>

        <div class="mt-10 flex flex-wrap items-center justify-between gap-3">
          <h2 class="font-display text-xl text-paper">Recent Inquiries</h2>
          <a href="/admin/inquiries.php" class="text-xs uppercase tracking-[0.2em] text-gold hover:text-paper">View all →</a>
        </div>
        <div class="mt-4 flex flex-col gap-2">
          <?php if (!$recent): ?>
            <p class="text-sm text-paper-dim">No inquiries yet.</p>
          <?php else: foreach ($recent as $r): ?>
            <div class="flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-ink/60 px-5 py-3.5">
              <div>
                <p class="text-sm text-paper"><?= hd($r['full_name']) ?> <span class="text-paper-faint">· <?= hd($TYPE_LABELS[$r['inquiry_type']] ?? $r['inquiry_type']) ?></span></p>
                <p class="text-xs text-paper-faint"><?= hd($r['email']) ?> · <?= hd(date('M j, g:ia', strtotime($r['created_at']))) ?></p>
              </div>
              <span class="border border-white/15 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-paper-dim"><?= hd(ucfirst($r['status'])) ?></span>
            </div>
          <?php endforeach; endif; ?>
        </div>

        <h2 class="mt-10 font-display text-xl text-paper">Quick Links</h2>
        <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <a href="/admin/index.php?section=hero" class="border border-white/10 bg-ink/60 px-4 py-3.5 text-sm text-paper-dim transition-colors hover:border-gold/40 hover:text-paper">✦ Hero Section</a>
          <a href="/admin/index.php?section=ancestral" class="border border-white/10 bg-ink/60 px-4 py-3.5 text-sm text-paper-dim transition-colors hover:border-gold/40 hover:text-paper">❖ Ancestral Collection</a>
          <a href="/admin/index.php?section=faq" class="border border-white/10 bg-ink/60 px-4 py-3.5 text-sm text-paper-dim transition-colors hover:border-gold/40 hover:text-paper">? FAQ</a>
          <a href="/admin/media.php" class="border border-white/10 bg-ink/60 px-4 py-3.5 text-sm text-paper-dim transition-colors hover:border-gold/40 hover:text-paper">🖼 Media Library</a>
        </div>
      </div>
    </main>
<?php
require __DIR__ . '/inc/layout_bottom.php';
