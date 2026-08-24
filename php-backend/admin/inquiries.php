<?php
declare(strict_types=1);

require_once __DIR__ . '/../auth.php';

$admin = hr_require_admin_page();
$activeSection = 'inquiries';
$pageTitle = 'Private Allocation Inquiries';
require __DIR__ . '/inc/layout_top.php';
?>
    <main class="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">
      <div class="sticky top-0 z-10 border-b border-white/15 bg-[#0f0f12]/95 px-6 py-5 backdrop-blur">
        <p class="mb-1 text-[0.62rem] font-medium uppercase tracking-[0.24em] text-gold">Leads</p>
        <h1 class="font-display text-2xl font-medium leading-tight text-paper md:text-3xl">Private Allocation Inquiries</h1>
        <div class="mt-4 flex flex-wrap gap-2" id="statusFilters">
          <button type="button" data-status="" class="border px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] border-gold/80 bg-gold/15 text-gold">All <span data-count="all"></span></button>
          <button type="button" data-status="new" class="border px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] border-white/25 text-[#cfcbc2]">New <span data-count="new"></span></button>
          <button type="button" data-status="contacted" class="border px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] border-white/25 text-[#cfcbc2]">Contacted <span data-count="contacted"></span></button>
          <button type="button" data-status="allocated" class="border px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] border-white/25 text-[#cfcbc2]">Allocated <span data-count="allocated"></span></button>
          <button type="button" data-status="declined" class="border px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] border-white/25 text-[#cfcbc2]">Declined <span data-count="declined"></span></button>
        </div>
      </div>

      <div class="flex-1 px-6 py-6">
        <p id="inq-msg" class="mb-4 hidden border border-seal/40 bg-seal/10 px-4 py-2.5 text-sm text-[#d98a8e]"></p>
        <p id="inq-empty" class="hidden text-sm text-paper-dim">No inquiries yet.</p>
        <div id="inq-list" class="flex flex-col gap-3"></div>
      </div>
    </main>
<?php
require __DIR__ . '/inc/layout_bottom.php';
?>
<script src="<?= htmlspecialchars(hr_asset_url('assets/admin-inquiries.js')) ?>"></script>
