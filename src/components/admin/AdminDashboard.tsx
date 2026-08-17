"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import MediaPicker from "@/components/admin/MediaPicker";

type ScalarField = {
  type: "text" | "textarea" | "number" | "boolean";
  key: string;
  label: string;
  hint?: string;
};
type UploadField = { type: "upload"; key: string; label: string; accept: "image" | "video"; hint?: string };
type ObjectField = { type: "object"; key: string; label: string; fields: Field[] };
type ArrayField = {
  type: "array";
  key: string;
  label: string;
  itemLabel: string;
  shape?: "scalar";
  scalarType?: "string" | "number";
  fields?: Field[];
};
type Field = ScalarField | UploadField | ObjectField | ArrayField;
type SectionDef = { key: string; title: string; icon: string; fields: Field[] };

export const SCHEMAS: SectionDef[] = [
  {
    key: "seo",
    title: "SEO & Meta",
    icon: "◎",
    fields: [
      { type: "text", key: "title", label: "Meta Title" },
      { type: "textarea", key: "description", label: "Meta Description" },
      { type: "text", key: "ogTitle", label: "OG Title (social)" },
      { type: "textarea", key: "ogDescription", label: "OG Description (social)" },
      { type: "text", key: "keywords", label: "Keywords (comma separated)" },
      { type: "upload", key: "ogImage", label: "Social Share Image", accept: "image" },
      { type: "boolean", key: "noindex", label: "Hide from search engines (noindex)" },
    ],
  },
  {
    key: "hero",
    title: "Hero Section",
    icon: "✦",
    fields: [
      { type: "text", key: "eyebrow", label: "Eyebrow line" },
      { type: "text", key: "title", label: "Headline" },
      { type: "text", key: "titleAccent", label: "Headline accent (gold italic)" },
      { type: "textarea", key: "sub", label: "Sub text" },
      { type: "text", key: "ctaPrimary", label: "Primary button text" },
      { type: "text", key: "ctaSecondary", label: "Secondary button text" },
    ],
  },
  {
    key: "stats",
    title: "Stats Strip",
    icon: "▤",
    fields: [
      {
        type: "array",
        key: "stats",
        label: "Facts",
        itemLabel: "Fact",
        fields: [
          { type: "number", key: "value", label: "Number" },
          { type: "text", key: "suffix", label: "Suffix (e.g. m)" },
          { type: "text", key: "label", label: "Label" },
        ],
      },
    ],
  },
  {
    key: "ancestral",
    title: "Ancestral Collection",
    icon: "❖",
    fields: [
      { type: "text", key: "name", label: "Name" },
      { type: "text", key: "tagline", label: "Tagline" },
      { type: "textarea", key: "description", label: "Description" },
      { type: "text", key: "elevation", label: "Elevation line" },
      { type: "text", key: "harvest", label: "Harvest line" },
      { type: "text", key: "cta", label: "Button text" },
      {
        type: "array",
        key: "tasting",
        label: "Tasting notes",
        itemLabel: "Note",
        fields: [
          { type: "text", key: "name", label: "Type (Flavour/Notes/Finish)" },
          { type: "text", key: "value", label: "Value" },
        ],
      },
      {
        type: "array",
        key: "tiers",
        label: "Pricing tiers",
        itemLabel: "Tier",
        fields: [
          { type: "text", key: "label", label: "Label" },
          {
            type: "object",
            key: "price",
            label: "Price",
            fields: [
              { type: "number", key: "AED", label: "AED" },
              { type: "number", key: "USD", label: "USD" },
              { type: "number", key: "NPR", label: "NPR" },
            ],
          },
          { type: "boolean", key: "featured", label: "Featured (gold highlight)" },
        ],
      },
    ],
  },
  {
    key: "civet",
    title: "Wild Civet Collection",
    icon: "👑",
    fields: [
      { type: "text", key: "name", label: "Name" },
      { type: "text", key: "badge", label: "Badge" },
      { type: "text", key: "tagline", label: "Tagline" },
      { type: "textarea", key: "description", label: "Description" },
      { type: "text", key: "elevation", label: "Elevation line" },
      { type: "text", key: "rarity", label: "Rarity line" },
      { type: "text", key: "cta", label: "Button text" },
      {
        type: "array",
        key: "tasting",
        label: "Tasting notes",
        itemLabel: "Note",
        fields: [
          { type: "text", key: "name", label: "Type" },
          { type: "text", key: "value", label: "Value" },
        ],
      },
      {
        type: "array",
        key: "tiers",
        label: "Pricing tiers",
        itemLabel: "Tier",
        fields: [
          { type: "text", key: "label", label: "Label" },
          {
            type: "object",
            key: "price",
            label: "Price",
            fields: [
              { type: "number", key: "AED", label: "AED" },
              { type: "number", key: "USD", label: "USD" },
              { type: "number", key: "NPR", label: "NPR" },
            ],
          },
          { type: "boolean", key: "featured", label: "Featured (gold highlight)" },
        ],
      },
    ],
  },
  {
    key: "craft",
    title: "Ancestral Craft",
    icon: "❂",
    fields: [
      { type: "text", key: "headline", label: "Headline" },
      { type: "text", key: "subheadline", label: "Sub headline" },
      { type: "textarea", key: "intro", label: "Intro" },
      {
        type: "array",
        key: "pillars",
        label: "Craft pillars",
        itemLabel: "Pillar",
        fields: [
          { type: "text", key: "title", label: "Title" },
          { type: "textarea", key: "text", label: "Text" },
        ],
      },
      {
        type: "object",
        key: "patience",
        label: "Patience quote",
        fields: [
          { type: "text", key: "big", label: "Big text (e.g. 10 MONTHS)" },
          { type: "text", key: "title", label: "Title" },
          { type: "textarea", key: "text", label: "Text" },
        ],
      },
    ],
  },
  {
    key: "packaging",
    title: "Eco Packaging",
    icon: "▣",
    fields: [
      { type: "text", key: "headline", label: "Headline" },
      { type: "text", key: "subheadline", label: "Sub headline" },
      { type: "textarea", key: "intro", label: "Intro" },
      { type: "textarea", key: "box", label: "Royal Box story" },
    ],
  },
  {
    key: "dubai",
    title: "Dubai Destination",
    icon: "◈",
    fields: [
      { type: "text", key: "headline", label: "Headline" },
      { type: "text", key: "subheadline", label: "Sub headline" },
      { type: "textarea", key: "text", label: "Body" },
      { type: "text", key: "location", label: "Location line" },
      { type: "text", key: "mapUrl", label: "Google Maps URL" },
    ],
  },
  {
    key: "press",
    title: "Press Marquee",
    icon: "≋",
    fields: [
      {
        type: "array",
        key: "press",
        label: "Claims / headlines",
        itemLabel: "Claim",
        shape: "scalar",
        scalarType: "string",
      },
    ],
  },
  {
    key: "nav",
    title: "Menu",
    icon: "☰",
    fields: [
      {
        type: "array",
        key: "nav",
        label: "Menu items",
        itemLabel: "Item",
        fields: [
          { type: "text", key: "id", label: "Section id (html anchor)" },
          { type: "text", key: "label", label: "Menu label" },
        ],
      },
    ],
  },
  {
    key: "footer",
    title: "Footer & Contact",
    icon: "❦",
    fields: [
      { type: "text", key: "legalName", label: "Company legal name" },
      { type: "text", key: "tagline", label: "Tagline" },
      { type: "text", key: "email", label: "Email" },
      { type: "text", key: "whatsapp", label: "WhatsApp (country code + number)" },
      { type: "text", key: "nepalEstate", label: "Nepal estate address" },
      { type: "text", key: "dubaiPartner", label: "Dubai partner address" },
      { type: "text", key: "copyright", label: "Copyright line" },
      { type: "text", key: "footline", label: "Bottom trust line" },
    ],
  },
  {
    key: "media",
    title: "Images & Video",
    icon: "🖼",
    fields: [
      { type: "upload", key: "heroVideo", label: "Hero background video", accept: "video", hint: "MP4/WebM, max 30MB — dropped into public/uploads" },
      { type: "upload", key: "heroPoster", label: "Hero poster image", accept: "image" },
      { type: "upload", key: "ancestral", label: "Ancestral collection image", accept: "image" },
      { type: "upload", key: "civet", label: "Civet collection image", accept: "image" },
      { type: "upload", key: "craft.terroir", label: "Craft — terroir", accept: "image" },
      { type: "upload", key: "craft.handpick", label: "Craft — handpicking", accept: "image" },
      { type: "upload", key: "craft.firewood", label: "Craft — firewood roasting", accept: "image" },
      { type: "upload", key: "craft.jato", label: "Craft — stone grinding", accept: "image" },
      { type: "upload", key: "packaging", label: "Packaging / Royal Box", accept: "image" },
      { type: "upload", key: "burj", label: "Burj Khalifa image", accept: "image" },
    ],
  },
];

type Draft = Record<string, unknown>;

function getAt(obj: Draft, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur === null || typeof cur !== "object" || Array.isArray(cur)) return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function setAt(obj: Draft, path: string[], value: unknown): Draft {
  const out: Draft = { ...obj };
  let cur: Draft = out;
  for (let i = 0; i < path.length - 1; i++) {
    const next = cur[path[i]];
    const nextObj: Draft = next && typeof next === "object" && !Array.isArray(next) ? { ...(next as Draft) } : {};
    cur[path[i]] = nextObj;
    cur = nextObj;
  }
  cur[path[path.length - 1]] = value;
  return out;
}

const cardCls = "rounded-[2px] border border-white/20 bg-[#19191d]";
const inputCls =
  "w-full rounded-[2px] border border-white/35 bg-[#232328] px-3.5 py-2.5 text-sm text-paper placeholder:text-[#a8a296] transition-colors duration-300 focus:border-gold focus:bg-[#26262c] focus:outline-none focus:ring-2 focus:ring-gold/30";
const labelCls = "text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold";
const btnCls =
  "inline-flex items-center gap-2 rounded-[2px] border border-white/30 bg-[#26262c] px-3.5 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-paper transition-colors duration-300 hover:border-gold hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-40";

type RenderCtx = { draft: Draft; setDraft: (d: Draft) => void };

function FieldRenderer({
  field,
  path,
  ctx,
  bare = false,
}: {
  field: Field;
  path: string[];
  ctx: RenderCtx;
  bare?: boolean;
}) {
  const { draft, setDraft } = ctx;
  const value = getAt(draft, path);

  if (field.type === "boolean") {
    const row = (
      <>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => setDraft(setAt(draft, path, e.target.checked))}
          className="h-4 w-4 shrink-0 accent-[#D4AF37]"
        />
        <span className="text-sm text-paper-dim">
          {field.label}
          {field.hint ? <span className="ml-2 text-paper-faint">— {field.hint}</span> : null}
        </span>
      </>
    );
    return bare ? (
      <label className="flex cursor-pointer items-center gap-3">{row}</label>
    ) : (
      <label className="flex cursor-pointer items-center gap-3 rounded-[2px] border border-white/20 bg-[#222227] px-4 py-3 hover:border-gold/50">
        {row}
      </label>
    );
  }

  if (field.type === "upload") {
    return <UploadField field={field} path={path} value={value} ctx={ctx} bare={bare} />;
  }

  if (field.type === "object") {
    return (
      <fieldset className="flex flex-col gap-3 rounded-[2px] border border-gold/25 bg-[#1e1e23] p-4">
        <legend className="px-2 text-[0.62rem] uppercase tracking-[0.22em] text-gold">{field.label}</legend>
        {field.fields.map((f) => (
          <FieldRenderer key={f.key} field={f} path={[...path, f.key]} ctx={ctx} />
        ))}
      </fieldset>
    );
  }

  if (field.type === "array") {
    const items = Array.isArray(value) ? (value as unknown[]) : [];
    return (
      <div className="flex flex-col gap-3 rounded-[2px] border border-white/20 bg-[#1e1e23] p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[0.62rem] uppercase tracking-[0.22em] text-gold">{field.label}</span>
          <button
            type="button"
            onClick={() => {
              const next = [...items];
              if (field.shape === "scalar") {
                next.push(field.scalarType === "number" ? 0 : "");
              } else {
                const blank: Record<string, unknown> = {};
                for (const f of field.fields ?? []) blank[f.key] = f.type === "boolean" ? false : f.type === "number" ? 0 : "";
                next.push(blank);
              }
              setDraft(setAt(draft, path, next));
            }}
            className={btnCls}
          >
            + Add {field.itemLabel}
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-xs text-paper-faint">No items yet.</p>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-3 rounded-[2px] border-l-2 border-gold/50 bg-[#232329] p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[0.62rem] uppercase tracking-[0.2em] text-[#cfcbc2]">
                  {field.itemLabel} {idx + 1}
                </span>
                <div className="flex gap-1.5">
                  <button type="button" disabled={idx === 0} onClick={() => move(items, idx, -1, path, draft, setDraft)} className={btnCls} title="Move up">
                    ↑
                  </button>
                  <button type="button" disabled={idx === items.length - 1} onClick={() => move(items, idx, 1, path, draft, setDraft)} className={btnCls} title="Move down">
                    ↓
                  </button>
                  <button type="button" onClick={() => removeItem(items, idx, path, draft, setDraft)} className={`${btnCls} !border-seal/40 !text-seal/80 hover:!border-seal hover:!text-seal`} title="Remove">
                    ✕
                  </button>
                </div>
              </div>

              {field.shape === "scalar" ? (
                <input
                  className={inputCls}
                  value={String(item ?? "")}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = field.scalarType === "number" ? Number(e.target.value) : e.target.value;
                    setDraft(setAt(draft, path, next));
                  }}
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {(field.fields ?? []).map((f) => (
                    <div key={f.key} className={f.type === "textarea" || f.type === "object" || f.type === "array" ? "sm:col-span-2" : ""}>
                      <FieldRenderer field={f} path={[...path, String(idx), f.key]} ctx={ctx} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    );
  }

  const control =
    field.type === "textarea" ? (
      <textarea
        className={`${inputCls} min-h-28 resize-y leading-relaxed`}
        value={String(value ?? "")}
        onChange={(e) => setDraft(setAt(draft, path, e.target.value))}
      />
    ) : field.type === "number" ? (
      <input
        type="number"
        className={inputCls}
        value={String(value ?? 0)}
        onChange={(e) => setDraft(setAt(draft, path, Number(e.target.value)))}
      />
    ) : (
      <input
        className={inputCls}
        value={String(value ?? "")}
        onChange={(e) => setDraft(setAt(draft, path, e.target.value))}
      />
    );

  if (bare) return control;

  return (
    <label className="flex flex-col gap-1.5">
      <span className={labelCls}>
        {field.label}
        {field.hint ? <span className="ml-2 normal-case tracking-normal text-paper-faint">— {field.hint}</span> : null}
      </span>
      {control}
    </label>
  );
}

function FieldCard({ field, path, ctx }: { field: Field; path: string[]; ctx: RenderCtx }) {
  const full = field.type === "textarea" || field.type === "object" || field.type === "array";
  return (
    <div className={full ? "lg:col-span-2" : ""}>
      <div className={`${cardCls} flex h-full min-w-0 flex-col gap-2.5 p-4`}>
        <div className="flex items-baseline justify-between gap-3 border-b border-white/5 pb-2.5">
          <span className={labelCls}>{field.label}</span>
          <span className="font-mono text-[0.58rem] tracking-tight text-paper-faint">{path.join(".")}</span>
        </div>
        <FieldRenderer field={field} path={path} ctx={ctx} bare />
      </div>
    </div>
  );
}

function move(items: unknown[], idx: number, dir: -1 | 1, path: string[], draft: Draft, setDraft: (d: Draft) => void) {
  const next = [...items];
  const j = idx + dir;
  [next[idx], next[j]] = [next[j], next[idx]];
  setDraft(setAt(draft, path, next));
}
function removeItem(items: unknown[], idx: number, path: string[], draft: Draft, setDraft: (d: Draft) => void) {
  const next = items.filter((_, i) => i !== idx);
  setDraft(setAt(draft, path, next));
}

function UploadField({
  field,
  path,
  value,
  ctx,
  bare = false,
}: {
  field: UploadField;
  path: string[];
  value: unknown;
  ctx: RenderCtx;
  bare?: boolean;
}) {
  const { draft, setDraft } = ctx;
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setMsg(body?.error ?? "Upload failed.");
        setBusy(false);
        return;
      }
      setDraft(setAt(draft, path, body.url));
      setMsg("Uploaded — click Save to persist.");
    } catch {
      setMsg("Upload failed.");
    }
    setBusy(false);
  };

  const url = String(value ?? "");
  const isVideo = field.accept === "video";

  return (
    <div className="flex flex-col gap-2.5 rounded-[2px] border border-white/20 bg-[#222227] p-3">
      {!bare ? (
        <span className={labelCls}>
          {field.label}
          {field.hint ? <span className="ml-2 normal-case tracking-normal text-paper-faint">— {field.hint}</span> : null}
        </span>
      ) : null}

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="relative h-20 w-32 shrink-0 overflow-hidden rounded-[2px] border border-white/25 bg-[#1b1b20] transition-colors duration-300 hover:border-gold/60"
          title="Open media library"
        >
          {url ? (
            isVideo ? (
              <video src={url} muted className="h-full w-full object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt={field.label} className="h-full w-full object-cover" />
            )
          ) : (
            <span className="flex h-full items-center justify-center gap-1.5 text-[0.6rem] uppercase tracking-[0.2em] text-[#a29c90]">
              <span className="text-base leading-none">🖼</span> none
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-paper opacity-0 transition-opacity duration-300 hover:opacity-100">
            Browse
          </span>
        </button>

        <div className="flex flex-1 flex-col gap-2">
          <input className={inputCls} value={url} onChange={(e) => setDraft(setAt(draft, path, e.target.value))} placeholder="/uploads/… or /images/…" />
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btnCls} onClick={() => setPickerOpen(true)}>
              Library / Upload
            </button>
            <label className={btnCls}>
              {busy ? "Uploading…" : "Quick Upload"}
              <input
                type="file"
                accept={field.accept === "video" ? "video/mp4,video/webm,video/mov" : "image/*"}
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
            </label>
          </div>
        </div>
      </div>

      {pickerOpen ? (
        <MediaPicker
          accept={field.accept}
          initialUrl={url}
          onSelect={(selected) => {
            setDraft(setAt(draft, path, selected));
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}

      {msg ? <p className="text-xs text-gold">{msg}</p> : null}
    </div>
  );
}

export default function AdminDashboard({ initial }: { initial: Record<string, unknown> }) {
  const params = useSearchParams();
  const [draft, setDraft] = useState<Draft>(() => JSON.parse(JSON.stringify(initial)));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [dirty, setDirty] = useState(false);
  const mainRef = useRef<HTMLElement | null>(null);

  const active = params.get("section") ?? "seo";
  const activeSchema = SCHEMAS.find((s) => s.key === active) ?? SCHEMAS[0];

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [active]);

  const applyDraft = (d: Draft) => {
    setDraft(d);
    setDirty(true);
    setStatus("idle");
  };

  const save = async () => {
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [activeSchema.key]: draft[activeSchema.key] }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setStatus("error");
        setStatusMsg(body?.error ?? "Save failed.");
        return;
      }
      setStatus("saved");
      setStatusMsg("Saved. Changes are live on the site.");
      setDirty(false);
    } catch {
      setStatus("error");
      setStatusMsg("Network error while saving.");
    }
  };

  return (
    <main ref={mainRef} className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">
          <div className="sticky top-0 z-10 border-b border-white/10 bg-ink/95 px-6 py-5 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="mb-1 text-[0.62rem] font-medium uppercase tracking-[0.24em] text-gold-dim">
                  Content Editor
                </p>
                <h1 className="font-display text-2xl font-medium leading-tight text-paper md:text-3xl">
                  {activeSchema.icon} {activeSchema.title}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={`h-2 w-2 rounded-full transition-colors duration-500 ${
                    status === "saving" ? "bg-gold" : dirty ? "bg-gold" : status === "saved" ? "bg-[#4caf50]" : "bg-paper-faint/40"
                  }`}
                />
                <span className="text-xs text-paper-dim">
                  {status === "saving"
                    ? "Saving…"
                    : status === "saved"
                      ? "Saved — changes are live."
                      : dirty
                        ? "Unsaved changes"
                        : "All changes are saved"}
                </span>
              </div>
            </div>
          </div>

          {status === "error" ? (
            <p className="mx-6 mt-4 border border-seal/40 bg-seal/10 px-4 py-3 text-sm text-[#d98a8e]">{statusMsg}</p>
          ) : null}

          <div className="grid grid-cols-1 gap-4 px-6 py-6 lg:grid-cols-2">
            {activeSchema.fields.map((f) => (
              <FieldCard key={f.key} field={f} path={[activeSchema.key, ...f.key.split(".")]} ctx={{ draft, setDraft: applyDraft }} />
            ))}
          </div>

          <div className="sticky bottom-0 z-10 mt-auto border-t border-white/10 bg-ink/95 px-6 py-4 backdrop-blur">
            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                className={`${btnCls} !border-seal/40 !text-seal/80 hover:!border-seal hover:!text-seal`}
                onClick={() => {
                  setDraft(JSON.parse(JSON.stringify(initial)));
                  setDirty(false);
                  setStatus("idle");
                  setStatusMsg("");
                }}
              >
                Revert changes
              </button>
              <button
                type="button"
                disabled={status === "saving" || (!dirty && status !== "saved")}
                onClick={save}
                className="inline-flex items-center gap-2 border border-gold bg-gold px-8 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-ink transition-all duration-300 hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40"
              >
                {status === "saving" ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </main>
  );
}