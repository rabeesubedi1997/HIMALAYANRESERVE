// Floating live-chat widget — sign up/sign in, then a persistent chat
// thread with the admin. Talks to /api/chat_auth.php + /api/chat.php.
(function () {
  const root = document.getElementById('chatWidgetRoot');
  if (!root) return;
  const panel = document.getElementById('chatPanel');
  const bodyEl = document.getElementById('chatBody');
  const toggleBtn = document.getElementById('chatToggleBtn');
  const closeBtn = document.getElementById('chatCloseBtn');

  let customer = null;
  let pollTimer = null;
  let lastId = 0;
  let mode = 'login'; // 'login' | 'register'

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  async function api(url, payload) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, body };
  }

  // ---- Auth forms ---------------------------------------------------------

  async function fetchCaptcha() {
    const { body } = await api('/api/chat_auth.php', { action: 'captcha' });
    const el = document.getElementById('chatCaptchaQuestion');
    if (el) el.textContent = (body.question || '?') + ' =';
  }

  function renderAuthForm() {
    stopPolling();
    bodyEl.innerHTML = '';
    const isRegister = mode === 'register';

    const wrap = document.createElement('div');
    wrap.className = 'flex flex-1 flex-col gap-3 overflow-y-auto p-4';
    wrap.innerHTML = `
      <p class="text-xs text-paper-dim">${isRegister ? 'Create an account to start chatting with our team.' : 'Sign in to continue your conversation.'}</p>
      <p id="chatAuthError" class="hidden border border-seal/40 bg-seal/10 px-3 py-2 text-xs text-[#d98a8e]"></p>
      ${isRegister ? '<input id="chatName" type="text" placeholder="Full name" class="border border-white/20 bg-[#1c1c1c] px-3.5 py-2.5 text-sm text-paper outline-none focus:border-gold" />' : ''}
      <input id="chatEmail" type="email" placeholder="Email address" class="border border-white/20 bg-[#1c1c1c] px-3.5 py-2.5 text-sm text-paper outline-none focus:border-gold" />
      <input id="chatPassword" type="password" placeholder="Password" class="border border-white/20 bg-[#1c1c1c] px-3.5 py-2.5 text-sm text-paper outline-none focus:border-gold" />
      ${isRegister ? `
      <div class="flex items-center gap-2">
        <span id="chatCaptchaQuestion" class="shrink-0 text-sm text-paper-dim">… =</span>
        <input id="chatCaptchaAnswer" type="text" inputmode="numeric" placeholder="Your answer" class="w-full border border-white/20 bg-[#1c1c1c] px-3.5 py-2.5 text-sm text-paper outline-none focus:border-gold" />
      </div>` : ''}
      <input id="chatWebsite" type="text" name="website" autocomplete="off" tabindex="-1" class="hidden" aria-hidden="true" />
      <button id="chatAuthSubmit" type="button" class="bg-gold px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-ink hover:bg-white">${isRegister ? 'Create Account' : 'Sign In'}</button>
      <button id="chatAuthSwitch" type="button" class="text-xs text-paper-dim underline hover:text-gold">${isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}</button>
    `;
    bodyEl.appendChild(wrap);

    if (isRegister) fetchCaptcha();

    document.getElementById('chatAuthSwitch').addEventListener('click', () => {
      mode = isRegister ? 'login' : 'register';
      renderAuthForm();
    });

    document.getElementById('chatAuthSubmit').addEventListener('click', async () => {
      const errEl = document.getElementById('chatAuthError');
      errEl.classList.add('hidden');
      const email = document.getElementById('chatEmail').value.trim();
      const password = document.getElementById('chatPassword').value;
      const website = document.getElementById('chatWebsite').value;
      const payload = isRegister
        ? {
            action: 'register',
            name: document.getElementById('chatName').value.trim(),
            email, password, website,
            captchaAnswer: document.getElementById('chatCaptchaAnswer').value.trim(),
          }
        : { action: 'login', email, password };

      const { ok, body } = await api('/api/chat_auth.php', payload);
      if (!ok) {
        errEl.textContent = body.error || 'Something went wrong.';
        errEl.classList.remove('hidden');
        // A wrong/expired answer consumes the challenge server-side —
        // fetch a fresh one so retrying isn't a dead end.
        if (body.captchaFailed) {
          document.getElementById('chatCaptchaAnswer').value = '';
          fetchCaptcha();
        }
        return;
      }
      customer = body.customer;
      renderChat();
    });
  }

  // ---- Chat thread ----------------------------------------------------------

  function renderChat() {
    bodyEl.innerHTML = `
      <div class="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span class="text-xs text-paper-faint">Signed in as ${esc(customer.name)}</span>
        <button id="chatSignOut" type="button" class="text-xs text-paper-faint underline hover:text-gold">Sign out</button>
      </div>
      <div id="chatMessages" class="flex flex-1 flex-col gap-2.5 overflow-y-auto p-4"></div>
      <form id="chatSendForm" class="flex items-end gap-2 border-t border-white/10 p-3">
        <textarea id="chatInput" rows="1" placeholder="Type a message…" class="min-h-[40px] flex-1 resize-none border border-white/20 bg-[#1c1c1c] px-3 py-2 text-sm text-paper outline-none focus:border-gold"></textarea>
        <button type="submit" class="bg-gold px-4 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ink hover:bg-white">Send</button>
      </form>
    `;
    lastId = 0;

    document.getElementById('chatSignOut').addEventListener('click', async () => {
      await api('/api/chat_auth.php', { action: 'logout' });
      customer = null;
      mode = 'login';
      renderAuthForm();
    });

    const form = document.getElementById('chatSendForm');
    const input = document.getElementById('chatInput');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      input.disabled = true;
      try {
        const res = await fetch('/api/chat.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: text }),
        });
        if (res.ok) {
          input.value = '';
          await poll();
        }
      } finally {
        input.disabled = false;
        input.focus();
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.requestSubmit();
      }
    });

    startPolling();
  }

  function appendMessages(messages) {
    const msgsEl = document.getElementById('chatMessages');
    if (!msgsEl) return;
    const nearBottom = msgsEl.scrollHeight - msgsEl.scrollTop - msgsEl.clientHeight < 80;
    for (const m of messages) {
      const isMine = m.sender === 'customer';
      const bubble = document.createElement('div');
      bubble.className = 'max-w-[85%] break-words px-3.5 py-2 text-sm ' +
        (isMine ? 'ml-auto bg-gold text-ink' : 'mr-auto border border-white/15 bg-[#1c1c1c] text-paper');
      bubble.textContent = m.body;
      msgsEl.appendChild(bubble);
      lastId = Math.max(lastId, Number(m.id));
    }
    if (nearBottom) msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  async function poll() {
    try {
      const res = await fetch('/api/chat.php?since_id=' + lastId);
      if (res.status === 401) {
        customer = null;
        stopPolling();
        mode = 'login';
        renderAuthForm();
        return;
      }
      if (!res.ok) return;
      const body = await res.json();
      if (body.messages?.length) appendMessages(body.messages);
    } catch {
      // silent — next poll retries
    }
  }

  function startPolling() {
    stopPolling();
    poll();
    pollTimer = setInterval(poll, 2000);
  }
  function stopPolling() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
  }

  // ---- Toggle open/close ----------------------------------------------------

  let initialized = false;
  async function openPanel() {
    panel.classList.remove('hidden');
    toggleBtn.setAttribute('aria-expanded', 'true');
    if (!initialized) {
      initialized = true;
      const { ok, body } = await api('/api/chat_auth.php', { action: 'me' });
      customer = ok ? body.customer : null;
      if (customer) renderChat();
      else renderAuthForm();
    }
  }
  function closePanel() {
    panel.classList.add('hidden');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  toggleBtn.addEventListener('click', () => {
    panel.classList.contains('hidden') ? openPanel() : closePanel();
  });
  closeBtn.addEventListener('click', closePanel);
})();
