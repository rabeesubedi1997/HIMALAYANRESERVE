// Private Allocation inquiries — list / status update / delete, talking to
// /admin/inquiries_api.php
(function () {
  const list = document.getElementById('inq-list');
  const empty = document.getElementById('inq-empty');
  const msg = document.getElementById('inq-msg');
  const filters = document.getElementById('statusFilters');
  let items = [];
  // Honor ?status=new etc. so links from the dashboard land pre-filtered.
  const VALID_STATUSES = ['new', 'contacted', 'allocated', 'declined'];
  const fromUrl = new URLSearchParams(location.search).get('status') ?? '';
  let status = VALID_STATUSES.includes(fromUrl) ? fromUrl : '';

  const TYPE_LABELS = {
    private_collection: 'Private Collection',
    royal_gifting: 'Royal Gifting',
    atmosphere_reservation: 'At.mosphere Reservation Inquiry',
  };
  const STATUS_LABELS = { new: 'New', contacted: 'Contacted', allocated: 'Allocated', declined: 'Declined' };

  // full_name/phone/country_city/message come from the PUBLIC allocation
  // form with no character whitelist — must never go into innerHTML raw.
  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function showMsg(text) {
    msg.textContent = text;
    msg.classList.toggle('hidden', !text);
  }

  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return iso;
    }
  }

  function waLink(phone) {
    return 'https://wa.me/' + String(phone).replace(/\D/g, '');
  }

  function render() {
    list.innerHTML = '';
    empty.classList.toggle('hidden', items.length > 0);
    for (const it of items) {
      const card = document.createElement('div');
      card.className = 'border border-white/10 bg-ink/70 p-5';
      card.innerHTML = `
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="font-display text-lg text-paper">${esc(it.full_name)}</p>
            <p class="mt-1 text-xs text-paper-faint">${esc(fmtDate(it.created_at))} · ${esc(TYPE_LABELS[it.inquiry_type] ?? it.inquiry_type)} · via ${esc(it.channel)}</p>
          </div>
          <div class="flex items-center gap-2">
            <select data-status-select="${it.id}" class="border border-white/20 bg-[#1c1c1c] px-3 py-1.5 text-xs uppercase tracking-[0.1em] text-paper">
              ${Object.entries(STATUS_LABELS).map(([v, l]) => `<option value="${v}" ${v === it.status ? 'selected' : ''}>${esc(l)}</option>`).join('')}
            </select>
            <button type="button" data-del="${it.id}" class="border border-seal/40 px-3 py-1.5 text-xs uppercase tracking-[0.1em] text-seal/80 hover:border-seal hover:bg-seal hover:text-paper">Delete</button>
          </div>
        </div>
        <div class="mt-4 grid grid-cols-1 gap-2 text-sm text-paper-dim sm:grid-cols-2">
          <a href="mailto:${esc(it.email)}" class="hover:text-gold">${esc(it.email)}</a>
          <a href="${esc(waLink(it.phone))}" target="_blank" rel="noopener noreferrer" class="hover:text-gold">${esc(it.phone)} (WhatsApp)</a>
          <span>${esc(it.country_city)}</span>
          <span class="text-paper-faint">${esc(it.ip ?? '')}</span>
        </div>
        ${it.message ? `<p class="mt-3 border-l-2 border-gold/30 pl-3 text-sm text-paper-dim">${esc(it.message)}</p>` : ''}
      `;
      list.appendChild(card);
    }
  }

  function renderCounts(counts) {
    const byStatus = Object.fromEntries((counts ?? []).map((c) => [c.status, c.n]));
    const total = Object.values(byStatus).reduce((a, b) => a + Number(b), 0);
    filters.querySelector('[data-count="all"]').textContent = `(${total})`;
    for (const key of ['new', 'contacted', 'allocated', 'declined']) {
      filters.querySelector(`[data-count="${key}"]`).textContent = `(${byStatus[key] ?? 0})`;
    }
  }

  async function refresh() {
    try {
      const qs = status ? '?status=' + encodeURIComponent(status) : '';
      const res = await fetch('/admin/inquiries_api.php' + qs);
      const body = await res.json();
      items = body.inquiries ?? [];
      renderCounts(body.counts);
      showMsg('');
      render();
    } catch {
      showMsg('Failed to load inquiries.');
    }
  }

  function setActiveFilterButton(forStatus) {
    filters.querySelectorAll('button').forEach((f) => {
      const active = f.dataset.status === forStatus;
      f.classList.toggle('border-gold/80', active);
      f.classList.toggle('bg-gold/15', active);
      f.classList.toggle('text-gold', active);
      f.classList.toggle('border-white/25', !active);
      f.classList.toggle('text-[#cfcbc2]', !active);
    });
  }

  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-status]');
    if (!btn) return;
    status = btn.dataset.status;
    setActiveFilterButton(status);
    refresh();
  });

  setActiveFilterButton(status);

  list.addEventListener('change', async (e) => {
    const sel = e.target.closest('[data-status-select]');
    if (!sel) return;
    const id = Number(sel.dataset.statusSelect);
    const newStatus = sel.value;
    try {
      const res = await fetch('/admin/inquiries_api.php', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        const item = items.find((i) => i.id === id);
        if (item) item.status = newStatus;
      } else {
        showMsg('Failed to update status.');
      }
    } catch {
      showMsg('Network error updating status.');
    }
  });

  list.addEventListener('click', async (e) => {
    const delBtn = e.target.closest('[data-del]');
    if (!delBtn) return;
    if (!confirm('Delete this inquiry? This cannot be undone.')) return;
    const id = Number(delBtn.dataset.del);
    try {
      const res = await fetch('/admin/inquiries_api.php?id=' + id, { method: 'DELETE' });
      if (res.ok) {
        items = items.filter((i) => i.id !== id);
        render();
      }
    } catch {
      showMsg('Network error deleting inquiry.');
    }
  });

  refresh();
})();
