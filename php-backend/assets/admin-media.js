// Media library page — list / upload / delete, talking to /admin/media_api.php
(function () {
  const grid = document.getElementById('media-grid');
  const msg = document.getElementById('media-msg');
  const countEl = document.getElementById('media-count');
  const dropzone = document.getElementById('dropzone');
  const dropzoneText = document.getElementById('dropzone-text');
  const fileInput = document.getElementById('fileInput');
  let allMedia = [];
  let filter = 'all';

  function showMsg(text) {
    msg.textContent = text;
    msg.classList.toggle('hidden', !text);
  }
  function fmtSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function render() {
    const items = allMedia.filter((m) => filter === 'all' || m.type === filter);
    countEl.textContent = `${allMedia.length} file${allMedia.length === 1 ? '' : 's'} · served live from /uploads`;
    grid.innerHTML = '';
    if (!items.length) {
      grid.innerHTML = '<p style="color:#8f8a7f;grid-column:1/-1;">No files yet.</p>';
      return;
    }
    for (const item of items) {
      const card = document.createElement('div');
      card.className = 'group flex flex-col overflow-hidden border border-white/20 bg-[#19191d] transition-colors duration-300 hover:border-gold/50';
      card.innerHTML = `
        <button type="button" data-copy="${item.url}" title="Click to copy URL" class="flex w-full ${item.type === 'video' ? 'aspect-video' : 'aspect-square'} overflow-hidden bg-[#101014]">
          ${item.type === 'video'
            ? `<video src="${item.url}" muted class="h-full w-full object-cover"></video>`
            : `<img src="${item.url}" alt="${item.name}" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />`}
        </button>
        <div class="flex flex-1 flex-col gap-2 border-t border-white/10 p-3">
          <span class="block truncate text-[0.72rem] text-[#e6e2d8]" title="${item.name}">${item.name}</span>
          <span class="text-[0.6rem] text-[#8f8a7f]">${item.type === 'image' ? 'Image' : item.type === 'video' ? 'Video' : 'File'} · ${fmtSize(item.size)}</span>
          <div class="mt-auto flex gap-2 pt-1">
            <button type="button" data-copy="${item.url}" class="flex-1 inline-flex items-center justify-center gap-2 border border-white/30 bg-[#26262c] px-3.5 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-paper hover:border-gold hover:bg-gold hover:text-ink">Copy URL</button>
            <button type="button" data-del="${item.url}" class="flex-1 inline-flex items-center justify-center gap-2 border border-seal/40 bg-[#26262c] px-3.5 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-seal/80 hover:border-seal hover:bg-seal hover:text-paper">Delete</button>
          </div>
        </div>`;
      grid.appendChild(card);
    }
  }

  async function refresh() {
    try {
      const res = await fetch('/admin/media_api.php');
      const body = await res.json();
      allMedia = body.media ?? [];
      showMsg('');
      render();
    } catch {
      showMsg('Failed to load media library.');
    }
  }

  async function upload(file) {
    if (!file) return;
    showMsg('');
    dropzoneText.textContent = `Uploading ${file.name}…`;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/admin/media_api.php', { method: 'POST', body: fd });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        showMsg(body?.error ?? 'Upload failed.');
      } else {
        await refresh();
      }
    } catch {
      showMsg('Network error while uploading.');
    }
    dropzoneText.textContent = 'Drag & drop files here, or click to browse';
    fileInput.value = '';
  }

  document.getElementById('browseBtn').addEventListener('click', () => fileInput.click());
  document.getElementById('browseBtn2').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => upload(e.target.files?.[0]));
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('border-gold', 'bg-gold/10'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('border-gold', 'bg-gold/10'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-gold', 'bg-gold/10');
    upload(e.dataTransfer.files?.[0]);
  });

  document.getElementById('filters').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    filter = btn.dataset.filter;
    document.querySelectorAll('#filters button').forEach((f) => {
      const active = f === btn;
      f.classList.toggle('border-gold/80', active);
      f.classList.toggle('bg-gold/15', active);
      f.classList.toggle('text-gold', active);
      f.classList.toggle('border-white/25', !active);
      f.classList.toggle('text-[#cfcbc2]', !active);
    });
    render();
  });

  grid.addEventListener('click', async (e) => {
    const copyBtn = e.target.closest('[data-copy]');
    if (copyBtn) {
      try {
        await navigator.clipboard.writeText(copyBtn.dataset.copy);
        const original = copyBtn.textContent;
        copyBtn.textContent = 'Copied ✓';
        setTimeout(() => (copyBtn.textContent = original), 1200);
      } catch {
        showMsg('Could not copy to clipboard.');
      }
      return;
    }
    const delBtn = e.target.closest('[data-del]');
    if (delBtn) {
      const url = delBtn.dataset.del;
      const res = await fetch('/admin/media_api.php?url=' + encodeURIComponent(url), { method: 'DELETE' });
      if (res.ok) {
        allMedia = allMedia.filter((m) => m.url !== url);
        render();
      }
    }
  });

  refresh();
})();
