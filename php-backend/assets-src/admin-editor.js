// Generic schema-driven content editor — vanilla JS port of AdminDashboard.tsx.
// Reads window.HR_INITIAL_SETTINGS + window.HR_ACTIVE_SECTION (injected by
// admin/index.php), renders the active section's fields, and PUTs changes
// to /admin/settings_api.php.

const SCHEMAS = [
  { key: 'seo', title: 'SEO & Meta', icon: '◎', fields: [
    { type: 'text', key: 'title', label: 'Meta Title' },
    { type: 'textarea', key: 'description', label: 'Meta Description' },
    { type: 'text', key: 'ogTitle', label: 'OG Title (social)' },
    { type: 'textarea', key: 'ogDescription', label: 'OG Description (social)' },
    { type: 'text', key: 'keywords', label: 'Keywords (comma separated)' },
    { type: 'upload', key: 'ogImage', label: 'Social Share Image', accept: 'image' },
    { type: 'boolean', key: 'noindex', label: 'Hide from search engines (noindex)' },
  ]},
  { key: 'hero', title: 'Hero Section', icon: '✦', fields: [
    { type: 'text', key: 'eyebrow', label: 'Eyebrow line' },
    { type: 'text', key: 'title', label: 'Headline' },
    { type: 'text', key: 'titleAccent', label: 'Headline accent (gold italic)' },
    { type: 'textarea', key: 'sub', label: 'Sub text' },
    { type: 'text', key: 'ctaPrimary', label: 'Primary button text' },
    { type: 'text', key: 'ctaSecondary', label: 'Secondary button text' },
  ]},
  { key: 'stats', title: 'Stats Strip', icon: '▤', fields: [
    { type: 'array', key: 'stats', label: 'Facts', itemLabel: 'Fact', fields: [
      { type: 'number', key: 'value', label: 'Number' },
      { type: 'text', key: 'suffix', label: 'Suffix (e.g. m)' },
      { type: 'text', key: 'label', label: 'Label' },
    ]},
  ]},
  { key: 'ancestral', title: 'Ancestral Collection', icon: '❖', fields: [
    { type: 'text', key: 'name', label: 'Name' },
    { type: 'text', key: 'tagline', label: 'Tagline' },
    { type: 'textarea', key: 'description', label: 'Description' },
    { type: 'text', key: 'elevation', label: 'Elevation line' },
    { type: 'text', key: 'harvest', label: 'Harvest line' },
    { type: 'text', key: 'cta', label: 'Button text' },
    { type: 'array', key: 'tasting', label: 'Tasting notes', itemLabel: 'Note', fields: [
      { type: 'text', key: 'name', label: 'Type (Flavour/Notes/Finish)' },
      { type: 'text', key: 'value', label: 'Value' },
    ]},
    { type: 'array', key: 'tiers', label: 'Pricing tiers', itemLabel: 'Tier', fields: [
      { type: 'text', key: 'label', label: 'Label' },
      { type: 'object', key: 'price', label: 'Price', fields: [
        { type: 'number', key: 'AED', label: 'AED' },
        { type: 'number', key: 'USD', label: 'USD' },
        { type: 'number', key: 'NPR', label: 'NPR' },
      ]},
      { type: 'boolean', key: 'featured', label: 'Featured (gold highlight)' },
    ]},
  ]},
  { key: 'civet', title: 'Wild Civet Collection', icon: '👑', fields: [
    { type: 'text', key: 'name', label: 'Name' },
    { type: 'text', key: 'badge', label: 'Badge' },
    { type: 'text', key: 'tagline', label: 'Tagline' },
    { type: 'textarea', key: 'description', label: 'Description' },
    { type: 'text', key: 'elevation', label: 'Elevation line' },
    { type: 'text', key: 'rarity', label: 'Rarity line' },
    { type: 'text', key: 'cta', label: 'Button text' },
    { type: 'array', key: 'tasting', label: 'Tasting notes', itemLabel: 'Note', fields: [
      { type: 'text', key: 'name', label: 'Type' },
      { type: 'text', key: 'value', label: 'Value' },
    ]},
    { type: 'array', key: 'tiers', label: 'Pricing tiers', itemLabel: 'Tier', fields: [
      { type: 'text', key: 'label', label: 'Label' },
      { type: 'object', key: 'price', label: 'Price', fields: [
        { type: 'number', key: 'AED', label: 'AED' },
        { type: 'number', key: 'USD', label: 'USD' },
        { type: 'number', key: 'NPR', label: 'NPR' },
      ]},
      { type: 'boolean', key: 'featured', label: 'Featured (gold highlight)' },
    ]},
  ]},
  { key: 'craft', title: 'Ancestral Craft', icon: '❂', fields: [
    { type: 'text', key: 'headline', label: 'Headline' },
    { type: 'text', key: 'subheadline', label: 'Sub headline' },
    { type: 'textarea', key: 'intro', label: 'Intro' },
    { type: 'array', key: 'pillars', label: 'Craft pillars', itemLabel: 'Pillar', fields: [
      { type: 'text', key: 'title', label: 'Title' },
      { type: 'textarea', key: 'text', label: 'Text' },
    ]},
    { type: 'object', key: 'patience', label: 'Patience quote', fields: [
      { type: 'text', key: 'big', label: 'Big text (e.g. 10 MONTHS)' },
      { type: 'text', key: 'title', label: 'Title' },
      { type: 'textarea', key: 'text', label: 'Text' },
    ]},
  ]},
  { key: 'packaging', title: 'Eco Packaging', icon: '▣', fields: [
    { type: 'text', key: 'headline', label: 'Headline' },
    { type: 'text', key: 'subheadline', label: 'Sub headline' },
    { type: 'textarea', key: 'intro', label: 'Intro' },
    { type: 'textarea', key: 'box', label: 'Royal Box story' },
  ]},
  { key: 'dubai', title: 'Dubai Destination', icon: '◈', fields: [
    { type: 'text', key: 'headline', label: 'Headline' },
    { type: 'text', key: 'subheadline', label: 'Sub headline' },
    { type: 'textarea', key: 'text', label: 'Body' },
    { type: 'text', key: 'location', label: 'Location line' },
    { type: 'text', key: 'mapUrl', label: 'Google Maps URL' },
  ]},
  { key: 'press', title: 'Press Marquee', icon: '≋', fields: [
    { type: 'array', key: 'press', label: 'Claims / headlines', itemLabel: 'Claim', shape: 'scalar', scalarType: 'string' },
  ]},
  { key: 'nav', title: 'Menu', icon: '☰', fields: [
    { type: 'array', key: 'nav', label: 'Menu items', itemLabel: 'Item', fields: [
      { type: 'text', key: 'id', label: 'Section id (html anchor)' },
      { type: 'text', key: 'label', label: 'Menu label' },
    ]},
  ]},
  { key: 'footer', title: 'Footer & Contact', icon: '❦', fields: [
    { type: 'text', key: 'legalName', label: 'Company legal name' },
    { type: 'text', key: 'tagline', label: 'Tagline' },
    { type: 'text', key: 'email', label: 'Email' },
    { type: 'text', key: 'whatsapp', label: 'WhatsApp (country code + number)' },
    { type: 'text', key: 'nepalEstate', label: 'Nepal estate address' },
    { type: 'text', key: 'dubaiPartner', label: 'Dubai partner address' },
    { type: 'text', key: 'copyright', label: 'Copyright line' },
    { type: 'text', key: 'footline', label: 'Bottom trust line' },
  ]},
  { key: 'media', title: 'Images & Video', icon: '🖼', fields: [
    { type: 'upload', key: 'heroVideo', label: 'Hero background video', accept: 'video', hint: 'MP4/WebM, max 30MB' },
    { type: 'upload', key: 'heroPoster', label: 'Hero poster image', accept: 'image' },
    { type: 'upload', key: 'ancestral', label: 'Ancestral collection image', accept: 'image' },
    { type: 'upload', key: 'civet', label: 'Civet collection image', accept: 'image' },
    { type: 'upload', key: 'craft.terroir', label: 'Craft — terroir', accept: 'image' },
    { type: 'upload', key: 'craft.handpick', label: 'Craft — handpicking', accept: 'image' },
    { type: 'upload', key: 'craft.firewood', label: 'Craft — firewood roasting', accept: 'image' },
    { type: 'upload', key: 'craft.jato', label: 'Craft — stone grinding', accept: 'image' },
    { type: 'upload', key: 'packaging', label: 'Packaging / Royal Box', accept: 'image' },
    { type: 'upload', key: 'burj', label: 'Burj Khalifa image', accept: 'image' },
  ]},
];

function getAt(obj, path) {
  let cur = obj;
  for (const p of path) {
    if (cur === null || typeof cur !== 'object' || Array.isArray(cur)) return undefined;
    cur = cur[p];
  }
  return cur;
}
function setAt(obj, path, value) {
  const out = Array.isArray(obj) ? [...obj] : { ...obj };
  let cur = out;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    const next = cur[key];
    const nextCopy = next && typeof next === 'object' ? (Array.isArray(next) ? [...next] : { ...next }) : {};
    cur[key] = nextCopy;
    cur = nextCopy;
  }
  cur[path[path.length - 1]] = value;
  return out;
}
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) if (c) node.appendChild(c);
  return node;
}

const INPUT_CLS = 'w-full border border-white/35 bg-[#232328] px-3.5 py-2.5 text-sm text-paper placeholder:text-[#a8a296] transition-colors duration-300 focus:border-gold focus:bg-[#26262c] focus:outline-none focus:ring-2 focus:ring-gold/30';
const LABEL_CLS = 'text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold';
const BTN_CLS = 'inline-flex items-center gap-2 border border-white/30 bg-[#26262c] px-3.5 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-paper transition-colors duration-300 hover:border-gold hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-40';
const BTN_DANGER_CLS = BTN_CLS + ' !border-seal/40 !text-seal/80 hover:!border-seal hover:!bg-seal hover:!text-paper';

// ---------------------------------------------------------------------------
// Media picker modal (reused by every upload field)
// ---------------------------------------------------------------------------
function openMediaPicker(accept, onSelect) {
  const overlay = el('div', { class: 'fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-6' });
  const modal = el('div', { class: 'flex max-h-[80vh] w-full max-w-3xl flex-col border border-white/20 bg-[#151518]' });
  const header = el('div', { class: 'flex items-center justify-between border-b border-white/10 px-5 py-4' }, [
    el('span', { class: 'font-display text-lg text-paper', html: 'Select Media' }),
    el('button', { type: 'button', class: BTN_CLS, onclick: () => overlay.remove(), html: 'Close' }),
  ]);
  const body = el('div', { class: 'flex-1 overflow-y-auto p-5' }, [el('p', { html: 'Loading…', class: 'text-sm text-[#8f8a7f]' })]);
  const uploadRow = el('div', { class: 'flex items-center gap-3 border-t border-white/10 p-4' });
  const fileInput = el('input', { type: 'file', accept: accept === 'video' ? 'video/mp4,video/webm,video/mov' : 'image/*', class: 'hidden' });
  const uploadBtn = el('button', { type: 'button', class: BTN_CLS, html: 'Upload New File', onclick: () => fileInput.click() });
  uploadRow.append(uploadBtn, fileInput);

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    uploadBtn.textContent = 'Uploading…';
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/admin/media_api.php', { method: 'POST', body: fd });
      const json = await res.json();
      if (res.ok) {
        onSelect(json.url);
        overlay.remove();
        return;
      }
    } catch {}
    uploadBtn.textContent = 'Upload New File';
  });

  modal.append(header, body, uploadRow);
  overlay.appendChild(modal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);

  fetch('/admin/media_api.php').then((r) => r.json()).then(({ media }) => {
    const items = (media || []).filter((m) => accept === 'video' ? m.type === 'video' : m.type !== 'video');
    body.innerHTML = '';
    if (!items.length) {
      body.appendChild(el('p', { class: 'text-sm text-[#8f8a7f]', html: 'No matching files yet — upload one below.' }));
      return;
    }
    const grid = el('div', { class: 'grid grid-cols-3 gap-3 sm:grid-cols-4' });
    for (const item of items) {
      const thumb = item.type === 'video'
        ? el('video', { src: item.url, muted: 'true', class: 'h-full w-full object-cover' })
        : el('img', { src: item.url, alt: item.name, class: 'h-full w-full object-cover' });
      const card = el('button', { type: 'button', class: 'group relative aspect-square overflow-hidden border border-white/20 hover:border-gold' }, [thumb]);
      card.addEventListener('click', () => { onSelect(item.url); overlay.remove(); });
      grid.appendChild(card);
    }
    body.appendChild(grid);
  }).catch(() => { body.innerHTML = ''; body.appendChild(el('p', { class: 'text-sm text-seal', html: 'Failed to load media library.' })); });
}

// ---------------------------------------------------------------------------
// Field renderer
// ---------------------------------------------------------------------------
function renderField(field, path, ctx, bare) {
  const value = getAt(ctx.draft, path);

  if (field.type === 'boolean') {
    const checkbox = el('input', { type: 'checkbox', class: 'h-4 w-4 shrink-0 accent-[#D4AF37]' });
    checkbox.checked = Boolean(value);
    checkbox.addEventListener('change', () => ctx.setDraft(setAt(ctx.draft, path, checkbox.checked)));
    const row = el('label', { class: bare ? 'flex cursor-pointer items-center gap-3' : 'flex cursor-pointer items-center gap-3 border border-white/20 bg-[#222227] px-4 py-3 hover:border-gold/50' }, [
      checkbox,
      el('span', { class: 'text-sm text-paper-dim', html: field.label + (field.hint ? ` <span class="text-paper-faint">— ${field.hint}</span>` : '') }),
    ]);
    return row;
  }

  if (field.type === 'upload') {
    return renderUploadField(field, path, value, ctx, bare);
  }

  if (field.type === 'object') {
    const fieldset = el('fieldset', { class: 'flex flex-col gap-3 border border-gold/25 bg-[#1e1e23] p-4' }, [
      el('legend', { class: 'px-2 text-[0.62rem] uppercase tracking-[0.22em] text-gold', html: field.label }),
    ]);
    for (const f of field.fields) fieldset.appendChild(renderFieldCard(f, [...path, f.key], ctx, true));
    return fieldset;
  }

  if (field.type === 'array') {
    const items = Array.isArray(value) ? value : [];
    const wrap = el('div', { class: 'flex flex-col gap-3 border border-white/20 bg-[#1e1e23] p-4' });
    const headerRow = el('div', { class: 'flex items-center justify-between gap-3' }, [
      el('span', { class: 'text-[0.62rem] uppercase tracking-[0.22em] text-gold', html: field.label }),
      el('button', {
        type: 'button', class: BTN_CLS, html: '+ Add ' + field.itemLabel,
        onclick: () => {
          const next = [...items];
          if (field.shape === 'scalar') next.push(field.scalarType === 'number' ? 0 : '');
          else {
            const blank = {};
            for (const f of field.fields || []) blank[f.key] = f.type === 'boolean' ? false : f.type === 'number' ? 0 : '';
            next.push(blank);
          }
          ctx.setDraftAndRerender(setAt(ctx.draft, path, next));
        },
      }),
    ]);
    wrap.appendChild(headerRow);

    if (!items.length) {
      wrap.appendChild(el('p', { class: 'text-xs text-paper-faint', html: 'No items yet.' }));
    } else {
      items.forEach((item, idx) => {
        const row = el('div', { class: 'flex flex-col gap-3 border-l-2 border-gold/50 bg-[#232329] p-3.5' });
        const rowHeader = el('div', { class: 'flex items-center justify-between gap-2' }, [
          el('span', { class: 'text-[0.62rem] uppercase tracking-[0.2em] text-[#cfcbc2]', html: `${field.itemLabel} ${idx + 1}` }),
          el('div', { class: 'flex gap-1.5' }, [
            el('button', { type: 'button', class: BTN_CLS, title: 'Move up', html: '↑', ...(idx === 0 ? { disabled: 'true' } : {}),
              onclick: () => { const next = [...items]; [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]]; ctx.setDraftAndRerender(setAt(ctx.draft, path, next)); } }),
            el('button', { type: 'button', class: BTN_CLS, title: 'Move down', html: '↓', ...(idx === items.length - 1 ? { disabled: 'true' } : {}),
              onclick: () => { const next = [...items]; [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]; ctx.setDraftAndRerender(setAt(ctx.draft, path, next)); } }),
            el('button', { type: 'button', class: BTN_DANGER_CLS, title: 'Remove', html: '✕',
              onclick: () => { const next = items.filter((_, i) => i !== idx); ctx.setDraftAndRerender(setAt(ctx.draft, path, next)); } }),
          ]),
        ]);
        row.appendChild(rowHeader);

        if (field.shape === 'scalar') {
          const input = el('input', { class: INPUT_CLS, value: String(item ?? '') });
          input.addEventListener('input', () => {
            const next = [...items];
            next[idx] = field.scalarType === 'number' ? Number(input.value) : input.value;
            ctx.setDraft(setAt(ctx.draft, path, next));
          });
          row.appendChild(input);
        } else {
          const grid = el('div', { class: 'grid gap-3 sm:grid-cols-2' });
          for (const f of field.fields || []) {
            const span = f.type === 'textarea' || f.type === 'object' || f.type === 'array' ? ' sm:col-span-2' : '';
            const cell = el('div', { class: span.trim() });
            cell.appendChild(renderFieldCard(f, [...path, String(idx), f.key], ctx, true));
            grid.appendChild(cell);
          }
          row.appendChild(grid);
        }
        wrap.appendChild(row);
      });
    }
    return wrap;
  }

  // text / textarea / number
  let control;
  if (field.type === 'textarea') {
    control = el('textarea', { class: INPUT_CLS + ' min-h-28 resize-y leading-relaxed' });
    control.value = String(value ?? '');
    control.addEventListener('input', () => ctx.setDraft(setAt(ctx.draft, path, control.value)));
  } else if (field.type === 'number') {
    control = el('input', { type: 'number', class: INPUT_CLS, value: String(value ?? 0) });
    control.addEventListener('input', () => ctx.setDraft(setAt(ctx.draft, path, Number(control.value))));
  } else {
    control = el('input', { class: INPUT_CLS, value: String(value ?? '') });
    control.addEventListener('input', () => ctx.setDraft(setAt(ctx.draft, path, control.value)));
  }

  if (bare) return control;

  return el('label', { class: 'flex flex-col gap-1.5' }, [
    el('span', { class: LABEL_CLS, html: field.label + (field.hint ? ` <span class="normal-case tracking-normal text-paper-faint">— ${field.hint}</span>` : '') }),
    control,
  ]);
}

function renderUploadField(field, path, value, ctx, bare) {
  const url = String(value ?? '');
  const isVideo = field.accept === 'video';
  const preview = el('button', { type: 'button', class: 'relative h-20 w-32 shrink-0 overflow-hidden border border-white/25 bg-[#1b1b20] transition-colors duration-300 hover:border-gold/60', title: 'Open media library' });
  preview.innerHTML = url
    ? (isVideo ? `<video src="${url}" muted class="h-full w-full object-cover"></video>` : `<img src="${url}" alt="${field.label}" class="h-full w-full object-cover" />`)
    : `<span class="flex h-full items-center justify-center gap-1.5 text-[0.6rem] uppercase tracking-[0.2em] text-[#a29c90]">🖼 none</span>`;
  preview.addEventListener('click', () => openMediaPicker(field.accept, (selected) => ctx.setDraftAndRerender(setAt(ctx.draft, path, selected))));

  const urlInput = el('input', { class: INPUT_CLS, value: url, placeholder: '/uploads/… or /images/…' });
  urlInput.addEventListener('input', () => ctx.setDraft(setAt(ctx.draft, path, urlInput.value)));

  const libraryBtn = el('button', { type: 'button', class: BTN_CLS, html: 'Library / Upload', onclick: () => openMediaPicker(field.accept, (selected) => ctx.setDraftAndRerender(setAt(ctx.draft, path, selected))) });

  const quickFile = el('input', { type: 'file', accept: isVideo ? 'video/mp4,video/webm,video/mov' : 'image/*', class: 'hidden' });
  const quickLabel = el('label', { class: BTN_CLS, html: 'Quick Upload' }, [quickFile]);
  quickFile.addEventListener('change', async () => {
    const file = quickFile.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/admin/media_api.php', { method: 'POST', body: fd });
    const body = await res.json().catch(() => null);
    if (res.ok) ctx.setDraftAndRerender(setAt(ctx.draft, path, body.url));
  });

  const wrap = el('div', { class: 'flex flex-col gap-2.5 border border-white/20 bg-[#222227] p-3' });
  if (!bare) wrap.appendChild(el('span', { class: LABEL_CLS, html: field.label + (field.hint ? ` <span class="normal-case tracking-normal text-paper-faint">— ${field.hint}</span>` : '') }));
  wrap.appendChild(el('div', { class: 'flex flex-col gap-2.5 sm:flex-row sm:items-center' }, [
    preview,
    el('div', { class: 'flex flex-1 flex-col gap-2' }, [urlInput, el('div', { class: 'flex flex-wrap gap-2' }, [libraryBtn, quickLabel])]),
  ]));
  return wrap;
}

function renderFieldCard(field, path, ctx, plain) {
  if (plain) return renderField(field, path, ctx, true);
  const full = field.type === 'textarea' || field.type === 'object' || field.type === 'array';
  const card = el('div', { class: full ? 'lg:col-span-2' : '' }, [
    el('div', { class: 'flex h-full min-w-0 flex-col gap-2.5 border border-white/20 bg-[#19191d] p-4' }, [
      el('div', { class: 'flex items-baseline justify-between gap-3 border-b border-white/5 pb-2.5' }, [
        el('span', { class: LABEL_CLS, html: field.label }),
        el('span', { class: 'font-mono text-[0.58rem] tracking-tight text-paper-faint', html: path.join('.') }),
      ]),
      renderField(field, path, ctx, true),
    ]),
  ]);
  return card;
}

// ---------------------------------------------------------------------------
// Page wiring
// ---------------------------------------------------------------------------
(function init() {
  const activeKey = window.HR_ACTIVE_SECTION || 'seo';
  const schema = SCHEMAS.find((s) => s.key === activeKey) || SCHEMAS[0];
  const initial = window.HR_INITIAL_SETTINGS || {};
  let draft = JSON.parse(JSON.stringify(initial));
  let dirty = false;
  let status = 'idle';

  const fieldsEl = document.getElementById('editor-fields');
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const errorBox = document.getElementById('editor-error');
  const saveBtn = document.getElementById('save-btn');
  const revertBtn = document.getElementById('revert-btn');

  const ctx = {
    get draft() { return draft; },
    // Silent: updates the draft + dirty flag without rebuilding the DOM.
    // Used for plain text/number/textarea/boolean inputs — the input
    // element already shows what was typed, so no re-render is needed
    // (and re-rendering on every keystroke would steal input focus).
    setDraft(next) {
      draft = next;
      dirty = true;
      status = 'idle';
      renderStatus();
    },
    // Structural: same as above, but also rebuilds the field list —
    // needed when the DOM itself must change shape (array add/remove/
    // reorder) or an unrelated element must reflect the new value
    // (upload field preview + url box after picking/uploading media).
    setDraftAndRerender(next) {
      ctx.setDraft(next);
      renderFields();
    },
  };

  function renderStatus() {
    statusDot.className = 'h-2 w-2 rounded-full transition-colors duration-500 ' +
      (status === 'saving' ? 'bg-gold' : dirty ? 'bg-gold' : status === 'saved' ? 'bg-[#4caf50]' : 'bg-paper-faint/40');
    statusText.textContent = status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved — changes are live.' : dirty ? 'Unsaved changes' : 'All changes are saved';
    saveBtn.disabled = status === 'saving' || (!dirty && status !== 'saved');
    saveBtn.textContent = status === 'saving' ? 'Saving…' : 'Save Changes';
  }

  function renderFields() {
    fieldsEl.innerHTML = '';
    for (const f of schema.fields) {
      fieldsEl.appendChild(renderFieldCard(f, [schema.key, ...f.key.split('.')], ctx, false));
    }
  }

  saveBtn.addEventListener('click', async () => {
    status = 'saving';
    renderStatus();
    try {
      const res = await fetch('/admin/settings_api.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [schema.key]: draft[schema.key] }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        status = 'error';
        errorBox.textContent = body?.error ?? 'Save failed.';
        errorBox.classList.remove('hidden');
        renderStatus();
        return;
      }
      status = 'saved';
      dirty = false;
      errorBox.classList.add('hidden');
      renderStatus();
    } catch {
      status = 'error';
      errorBox.textContent = 'Network error while saving.';
      errorBox.classList.remove('hidden');
      renderStatus();
    }
  });

  revertBtn.addEventListener('click', () => {
    draft = JSON.parse(JSON.stringify(initial));
    dirty = false;
    status = 'idle';
    errorBox.classList.add('hidden');
    renderStatus();
    renderFields();
  });

  renderFields();
  renderStatus();
})();
