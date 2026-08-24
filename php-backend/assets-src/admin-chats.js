// Live Chat conversation list — /admin/chats.php, talking to /admin/chat_api.php
(function () {
  const list = document.getElementById('chats-list');
  const empty = document.getElementById('chats-empty');

  // customer_name/email/last_message are all free text supplied by the
  // customer at signup / in chat — never trust them in innerHTML raw.
  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function fmtDate(iso) {
    try {
      return new Date(iso.replace(' ', 'T')).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return iso;
    }
  }

  function render(conversations) {
    empty.classList.toggle('hidden', conversations.length > 0);
    list.innerHTML = '';
    for (const c of conversations) {
      const row = document.createElement('a');
      row.href = '/admin/chat_thread.php?id=' + c.id;
      row.className = 'flex items-center justify-between gap-4 border border-white/10 bg-ink/70 px-5 py-4 transition-colors hover:border-gold/40';
      row.innerHTML = `
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <p class="truncate font-display text-base text-paper">${esc(c.customer_name)}</p>
            ${Number(c.admin_unread) > 0 ? `<span class="shrink-0 bg-gold px-2 py-0.5 text-[0.6rem] font-bold text-ink">${c.admin_unread} new</span>` : ''}
            ${c.status === 'closed' ? '<span class="shrink-0 border border-white/20 px-2 py-0.5 text-[0.6rem] uppercase text-paper-faint">Closed</span>' : ''}
          </div>
          <p class="truncate text-xs text-paper-faint">${esc(c.customer_email)}</p>
          <p class="mt-1 truncate text-sm text-paper-dim">${esc(c.last_message || '(no messages)')}</p>
        </div>
        <span class="shrink-0 text-xs text-paper-faint">${esc(fmtDate(c.last_message_at))}</span>
      `;
      list.appendChild(row);
    }
  }

  async function refresh() {
    try {
      const res = await fetch('/admin/chat_api.php');
      const body = await res.json();
      render(body.conversations ?? []);
    } catch {
      // silent — next poll will retry
    }
  }

  refresh();
  setInterval(refresh, 8000);
})();
