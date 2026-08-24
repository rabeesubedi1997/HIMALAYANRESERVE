<?php
declare(strict_types=1);

require_once __DIR__ . '/../auth.php';

$admin = hr_require_admin_page();
$activeSection = 'media';
$pageTitle = 'Media Library';
require __DIR__ . '/inc/layout_top.php';
?>
    <main class="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">
      <div class="sticky top-0 z-10 border-b border-white/15 bg-[#0f0f12]/95 px-6 py-5 backdrop-blur">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="mb-1 text-[0.62rem] font-medium uppercase tracking-[0.24em] text-gold">Assets</p>
            <h1 class="font-display text-2xl font-medium leading-tight text-paper md:text-3xl">Media Library</h1>
            <p class="mt-1 text-xs text-[#8f8a7f]" id="media-count">Loading…</p>
          </div>
          <button type="button" id="browseBtn" class="inline-flex items-center gap-2 border border-white/30 bg-[#26262c] px-3.5 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-paper transition-colors duration-300 hover:border-gold hover:bg-gold hover:text-ink">
            ↓ Upload from computer
          </button>
          <input id="fileInput" type="file" accept="image/*,video/mp4,video/webm,video/mov" class="hidden" />
        </div>
        <div class="mt-4 flex gap-2" id="filters">
          <button type="button" data-filter="all" class="border px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] border-gold/80 bg-gold/15 text-gold">All</button>
          <button type="button" data-filter="image" class="border px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] border-white/25 text-[#cfcbc2]">Images</button>
          <button type="button" data-filter="video" class="border px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] border-white/25 text-[#cfcbc2]">Videos</button>
        </div>
      </div>

      <div class="flex-1 px-6 py-6">
        <p id="media-msg" class="mb-4 hidden border border-seal/40 bg-seal/10 px-4 py-2.5 text-sm text-[#d98a8e]"></p>

        <div id="dropzone" class="mb-6 flex min-h-32 flex-col items-center justify-center gap-2 border-2 border-dashed border-white/25 bg-[#1a1a1f] px-6 py-8 text-center">
          <span class="text-2xl">⬆</span>
          <p id="dropzone-text" class="text-sm font-medium text-[#cfcbc2]">Drag & drop files here, or click to browse</p>
          <p class="text-[0.65rem] text-[#8f8a7f]">Images or videos, up to 30MB each — instantly available on the site after Save.</p>
          <button type="button" id="browseBtn2" class="inline-flex items-center gap-2 border border-white/30 bg-[#26262c] px-3.5 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-paper hover:border-gold hover:bg-gold hover:text-ink">Browse files</button>
        </div>

        <div id="media-grid" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"></div>
      </div>
    </main>
<?php
require __DIR__ . '/inc/layout_bottom.php';
?>
<script src="/assets/admin-media.js"></script>
