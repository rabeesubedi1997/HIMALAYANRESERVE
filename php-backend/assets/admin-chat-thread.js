// Single conversation thread — /admin/chat_thread.php, talking to /admin/chat_api.php
(function () {
  const convId = window.HR_CONVERSATION_ID;
  const titleEl = document.getElementById('thread-title');
  const messagesEl = document.getElementById('thread-messages');
  const form = document.getElementById('replyForm');
  const bodyInput = document.getElementById('replyBody');
  const closeBtn = document.getElementById('closeToggleBtn');

  let lastId = 0;
  let status = 'open';
  let customerName = '';

  // Message bodies are free text from the customer (or admin) — escape
  // before ever touching innerHTML.
  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function fmtTime(iso) {
    try {
      return new Date(iso.replace(' ', 'T')).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  function appendMessages(messages) {
    const nearBottom = messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 80;
    for (const m of messages) {
      const bubble = document.createElement('div');
      const isAdmin = m.sender === 'admin';
      bubble.className = 'max-w-[75%] break-words px-4 py-2.5 text-sm ' +
        (isAdmin ? 'ml-auto bg-gold text-ink' : 'mr-auto border border-white/15 bg-ink/70 text-paper');
      bubble.innerHTML = `<p>${esc(m.body)}</p><p class="mt-1 text-[0.62rem] opacity-60">${esc(fmtTime(m.created_at))}</p>`;
      messagesEl.appendChild(bubble);
      lastId = Math.max(lastId, Number(m.id));
    }
    if (nearBottom) messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function updateCloseBtn() {
    closeBtn.textContent = status === 'closed' ? 'Reopen Chat' : 'Close Chat';
  }

  async function poll() {
    try {
      const res = await fetch(`/admin/chat_api.php?id=${convId}&since_id=${lastId}`);
      if (!res.ok) return;
      const body = await res.json();
      if (body.conversation) {
        status = body.conversation.status;
        customerName = body.conversation.customer_name;
        titleEl.textContent = customerName + ' · ' + body.conversation.customer_email;
        updateCloseBtn();
      }
      if (body.messages?.length) appendMessages(body.messages);
    } catch {
      // silent — next poll retries
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = bodyInput.value.trim();
    if (!text) return;
    bodyInput.disabled = true;
    try {
      const res = await fetch('/admin/chat_api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: convId, body: text }),
      });
      if (res.ok) {
        bodyInput.value = '';
        await poll();
      }
    } finally {
      bodyInput.disabled = false;
      bodyInput.focus();
    }
  });

  bodyInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  closeBtn.addEventListener('click', async () => {
    const next = status === 'closed' ? 'open' : 'closed';
    const res = await fetch('/admin/chat_api.php', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: convId, status: next }),
    });
    if (res.ok) {
      status = next;
      updateCloseBtn();
    }
  });

  poll();
  setInterval(poll, 2000);
})();
