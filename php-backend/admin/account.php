<?php
declare(strict_types=1);

require_once __DIR__ . '/../auth.php';

$admin = hr_require_admin_page();
$activeSection = 'account';
$pageTitle = 'Security';
require __DIR__ . '/inc/layout_top.php';
?>
    <main class="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">
      <div class="sticky top-0 z-10 border-b border-white/15 bg-[#0f0f12]/95 px-6 py-5 backdrop-blur">
        <p class="mb-1 text-[0.62rem] font-medium uppercase tracking-[0.24em] text-gold">Account</p>
        <h1 class="font-display text-2xl font-medium leading-tight text-paper md:text-3xl">Security</h1>
      </div>

      <div class="flex-1 px-6 py-6">
        <form id="passwordForm" class="flex max-w-md flex-col gap-5 border border-white/10 bg-ink/70 p-6 backdrop-blur-sm md:p-8">
          <p class="text-sm text-paper-dim">
            Signed in as <span class="text-paper"><?= htmlspecialchars($admin['username']) ?></span>.
            Change your password below — you'll need your current one.
          </p>
          <p id="formMsg" class="hidden border px-4 py-2.5 text-sm"></p>

          <label class="flex flex-col gap-2">
            <span class="eyebrow !text-[0.6rem] text-gold-dim">Current Password</span>
            <input type="password" name="currentPassword" autocomplete="current-password" required
              class="border border-white/20 bg-[#1c1c1c] px-4 py-3 text-sm text-paper outline-none focus:border-gold" />
          </label>
          <label class="flex flex-col gap-2">
            <span class="eyebrow !text-[0.6rem] text-gold-dim">New Password</span>
            <input type="password" name="newPassword" autocomplete="new-password" required minlength="10"
              class="border border-white/20 bg-[#1c1c1c] px-4 py-3 text-sm text-paper outline-none focus:border-gold" />
            <span class="text-xs text-paper-faint">At least 10 characters.</span>
          </label>
          <label class="flex flex-col gap-2">
            <span class="eyebrow !text-[0.6rem] text-gold-dim">Confirm New Password</span>
            <input type="password" name="confirmPassword" autocomplete="new-password" required minlength="10"
              class="border border-white/20 bg-[#1c1c1c] px-4 py-3 text-sm text-paper outline-none focus:border-gold" />
          </label>

          <button type="submit" class="bg-gold px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-ink transition-colors hover:bg-white">
            Update Password
          </button>
        </form>
      </div>
    </main>
<?php
require __DIR__ . '/inc/layout_bottom.php';
?>
<script>
  document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const msg = document.getElementById('formMsg');
    const data = Object.fromEntries(new FormData(form).entries());
    msg.className = 'border px-4 py-2.5 text-sm';
    if (data.newPassword !== data.confirmPassword) {
      msg.textContent = 'New password and confirmation do not match.';
      msg.classList.add('border-seal/40', 'bg-seal/10', 'text-[#d98a8e]');
      return;
    }
    const btn = form.querySelector('button');
    btn.disabled = true;
    try {
      const res = await fetch('/admin/account_api.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        msg.textContent = 'Password updated.';
        msg.classList.add('border-gold/40', 'bg-gold/10', 'text-gold');
        form.reset();
      } else {
        msg.textContent = json.error || 'Failed to update password.';
        msg.classList.add('border-seal/40', 'bg-seal/10', 'text-[#d98a8e]');
      }
    } catch {
      msg.textContent = 'Network error — please try again.';
      msg.classList.add('border-seal/40', 'bg-seal/10', 'text-[#d98a8e]');
    } finally {
      btn.disabled = false;
    }
  });
</script>
