<?php
declare(strict_types=1);

require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../inc/settings.php';

$admin = hr_require_admin_page();

$sectionMeta = [
    'seo' => ['title' => 'SEO & Meta', 'icon' => '◎'],
    'hero' => ['title' => 'Hero Section', 'icon' => '✦'],
    'stats' => ['title' => 'Stats Strip', 'icon' => '▤'],
    'ancestral' => ['title' => 'Ancestral Collection', 'icon' => '❖'],
    'civet' => ['title' => 'Wild Civet Collection', 'icon' => '👑'],
    'craft' => ['title' => 'Ancestral Craft', 'icon' => '❂'],
    'packaging' => ['title' => 'Eco Packaging', 'icon' => '▣'],
    'dubai' => ['title' => 'Dubai Destination', 'icon' => '◈'],
    'press' => ['title' => 'Press Marquee', 'icon' => '≋'],
    'nav' => ['title' => 'Menu', 'icon' => '☰'],
    'footer' => ['title' => 'Footer & Contact', 'icon' => '❦'],
    'media' => ['title' => 'Images & Video', 'icon' => '🖼'],
];

$activeSection = $_GET['section'] ?? 'seo';
if (!isset($sectionMeta[$activeSection])) {
    $activeSection = 'seo';
}
$pageTitle = $sectionMeta[$activeSection]['title'];

$settings = hr_get_settings();

require __DIR__ . '/inc/layout_top.php';
?>
    <main class="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">
      <div class="sticky top-0 z-10 border-b border-white/10 bg-ink/95 px-6 py-5 backdrop-blur">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="mb-1 text-[0.62rem] font-medium uppercase tracking-[0.24em] text-gold-dim">Content Editor</p>
            <h1 class="font-display text-2xl font-medium leading-tight text-paper md:text-3xl">
              <?= $sectionMeta[$activeSection]['icon'] ?> <?= htmlspecialchars($pageTitle) ?>
            </h1>
          </div>
          <div class="flex items-center gap-2">
            <span id="status-dot" class="h-2 w-2 rounded-full bg-paper-faint/40"></span>
            <span id="status-text" class="text-xs text-paper-dim">All changes are saved</span>
          </div>
        </div>
      </div>

      <p id="editor-error" class="mx-6 mt-4 hidden border border-seal/40 bg-seal/10 px-4 py-3 text-sm text-[#d98a8e]"></p>

      <div id="editor-fields" class="grid grid-cols-1 gap-4 px-6 py-6 lg:grid-cols-2"></div>

      <div class="sticky bottom-0 z-10 mt-auto border-t border-white/10 bg-ink/95 px-6 py-4 backdrop-blur">
        <div class="flex flex-wrap items-center justify-end gap-3">
          <button type="button" id="revert-btn" class="inline-flex items-center gap-2 border border-seal/40 bg-[#26262c] px-3.5 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-seal/80 hover:border-seal hover:bg-seal hover:text-paper">
            Revert changes
          </button>
          <button type="button" id="save-btn" class="inline-flex items-center gap-2 border border-gold bg-gold px-8 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-ink transition-all duration-300 hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40">
            Save Changes
          </button>
        </div>
      </div>
    </main>
<?php
require __DIR__ . '/inc/layout_bottom.php';
?>
<script>
  window.HR_ACTIVE_SECTION = <?= json_encode($activeSection) ?>;
  window.HR_INITIAL_SETTINGS = <?= json_encode($settings) ?>;
</script>
<script src="/assets/admin-editor.js"></script>
