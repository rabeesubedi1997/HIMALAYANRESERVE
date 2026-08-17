"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type MediaItem = { name: string; url: string; size: number; type: string; modified: string };
type Filter = "all" | "image" | "video";

const fmtSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
};

const btn =
  "inline-flex items-center gap-2 rounded-[2px] border border-white/30 bg-[#26262c] px-3.5 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-paper transition-colors duration-300 hover:border-gold hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-40";

export default function MediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [msg, setMsg] = useState("");
  const [copiedUrl, setCopiedUrl] = useState("");
  const uploadRef = useRef<HTMLInputElement | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/media");
      if (!res.ok) throw new Error();
      const body = await res.json();
      setMedia(body.media ?? []);
    } catch {
      setMsg("Failed to load media library.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/admin/media")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((body) => {
        setMedia(body.media ?? []);
        setMsg("");
      })
      .catch(() => setMsg("Failed to load media library."))
      .finally(() => setLoading(false));
  }, []);

  const upload = async (files: File[] | null) => {
    const f = files?.[0];
    if (!f) return;
    setFile(f);
    setBusy(true);
    setMsg("");
    const fd = new FormData();
    fd.append("file", f);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setMsg(body?.error ?? "Upload failed.");
        setBusy(false);
        return;
      }
      setFile(null);
      if (uploadRef.current) uploadRef.current.value = "";
      await refresh();
    } catch {
      setMsg("Network error while uploading.");
    }
    setBusy(false);
  };

  const del = async (item: MediaItem) => {
    const url = new URL(item.url, window.location.origin);
    const res = await fetch(`/api/admin/media?url=${encodeURIComponent(url.pathname)}`, { method: "DELETE" });
    if (res.ok) setMedia((prev) => prev.filter((m) => m.url !== item.url));
  };

  const copy = async (item: MediaItem) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedUrl(item.url);
      window.setTimeout(() => setCopiedUrl(""), 1500);
    } catch {
      setMsg("Could not copy to clipboard.");
    }
  };

  const filtered = media.filter((m) => filter === "all" || m.type === filter);

  return (
    <div className="flex min-h-0 w-full flex-1">
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="sticky top-0 z-10 border-b border-white/15 bg-[#0f0f12]/95 px-6 py-5 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-1 text-[0.62rem] font-medium uppercase tracking-[0.24em] text-gold">Assets</p>
              <h1 className="font-display text-2xl font-medium leading-tight text-paper md:text-3xl">Media Library</h1>
              <p className="mt-1 text-xs text-[#8f8a7f]">
                {media.length} file{media.length === 1 ? "" : "s"} · served live from /uploads
              </p>
            </div>
            <button type="button" className={btn} onClick={() => uploadRef.current?.click()}>
              ↓ Upload from computer
            </button>
            <input
              ref={uploadRef}
              type="file"
              accept="image/*,video/mp4,video/webm,video/mov"
              className="hidden"
              onChange={(e) => upload(Array.from(e.target.files ?? []))}
            />
          </div>

          <div className="mt-4 flex gap-2">
            {(["all", "image", "video"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-[2px] border px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 ${
                  filter === f ? "border-gold/80 bg-gold/15 text-gold" : "border-white/25 text-[#cfcbc2] hover:text-paper"
                }`}
              >
                {f === "all" ? `All (${media.length})` : f === "image" ? `Images (${media.filter((m) => m.type === "image").length})` : `Videos (${media.filter((m) => m.type === "video").length})`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 px-6 py-6">
          {msg ? <p className="mb-4 border border-seal/40 bg-seal/10 px-4 py-2.5 text-sm text-[#d98a8e]">{msg}</p> : null}

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              upload(Array.from(e.dataTransfer.files ?? []));
            }}
            className={`mb-6 flex min-h-32 flex-col items-center justify-center gap-2 rounded-[2px] border-2 border-dashed px-6 py-8 text-center transition-colors duration-300 ${
              dragOver ? "border-gold bg-gold/10" : "border-white/25 bg-[#1a1a1f]"
            }`}
          >
            <span className="text-2xl">⬆</span>
            <p className="text-sm font-medium text-[#cfcbc2]">
              {busy ? `Uploading ${file?.name ?? "file"}…` : file ? `Selected: ${file.name} · ${fmtSize(file.size)}` : "Drag & drop files here, or click to browse"}
            </p>
            <p className="text-[0.65rem] text-[#8f8a7f]">Images or videos, up to 30MB each — instantly available on the site after Save.</p>
            <button type="button" className={btn} onClick={() => uploadRef.current?.click()}>
              Browse files
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-[#8f8a7f]">Loading library…</p>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <span className="text-3xl">🖼</span>
              <p className="text-sm text-[#cfcbc2]">No {filter === "all" ? "" : filter + " "}files yet.</p>
              <p className="text-xs text-[#8f8a7f]">Upload your first image or video above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((item) => (
                <div key={item.url} className="group flex flex-col overflow-hidden rounded-[2px] border border-white/20 bg-[#19191d] transition-colors duration-300 hover:border-gold/50">
                  <button
                    type="button"
                    onClick={() => copy(item)}
                    title="Click to copy URL"
                    className={`flex w-full ${item.type === "video" ? "aspect-video" : "aspect-square"} overflow-hidden bg-[#101014]`}
                  >
                    {item.type === "video" ? (
                      <video src={item.url} muted className="h-full w-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                  </button>
                  <div className="flex flex-1 flex-col gap-2 border-t border-white/10 p-3">
                    <span className="block truncate text-[0.72rem] text-[#e6e2d8]" title={item.name}>
                      {item.name}
                    </span>
                    <span className="text-[0.6rem] text-[#8f8a7f]">
                      {item.type === "image" ? "Image" : item.type === "video" ? "Video" : "File"} · {fmtSize(item.size)} · {fmtDate(item.modified)}
                    </span>
                    <div className="mt-auto flex gap-2 pt-1">
                      <button type="button" className={btn} onClick={() => copy(item)}>
                        {copiedUrl === item.url ? "Copied ✓" : "Copy URL"}
                      </button>
                      <button
                        type="button"
                        onClick={() => del(item)}
                        className={`${btn} !border-seal/40 !text-seal/80 hover:!border-seal hover:!bg-seal hover:!text-paper`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}