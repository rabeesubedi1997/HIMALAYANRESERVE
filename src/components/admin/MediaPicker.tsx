"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type MediaItem = { name: string; url: string; size: number; type: string; modified: string };

type MediaPickerProps = {
  accept: "image" | "video";
  initialUrl?: string;
  onSelect: (url: string) => void;
  onClose: () => void;
};

const fmtSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
};

export default function MediaPicker({ accept, initialUrl, onSelect, onClose }: MediaPickerProps) {
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/media");
      if (!res.ok) throw new Error();
      const body = await res.json();
      setMedia((body.media ?? []).filter((m: MediaItem) => m.type === accept));
    } catch {
      setMsg("Failed to load media library.");
    } finally {
      setLoading(false);
    }
  }, [accept]);

  useEffect(() => {
    fetch("/api/admin/media")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((body) => {
        setMedia((body.media ?? []).filter((m: MediaItem) => m.type === accept));
        setMsg("");
      })
      .catch(() => setMsg("Failed to load media library."))
      .finally(() => setLoading(false));
  }, [accept]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const doUpload = async () => {
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
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await refresh();
      onSelect(body.url as string);
      onClose();
    } catch {
      setMsg("Network error while uploading.");
      setBusy(false);
    }
  };

  const del = async (item: MediaItem) => {
    const url = new URL(item.url, window.location.origin);
    const res = await fetch(`/api/admin/media?url=${encodeURIComponent(url.pathname)}`, { method: "DELETE" });
    if (res.ok) {
      setMedia((prev) => prev.filter((m) => m.url !== item.url));
      if (item.url === initialUrl) onSelect("");
    }
  };

  const btn =
    "inline-flex items-center gap-2 rounded-[2px] border border-white/30 bg-[#26262c] px-3.5 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-paper transition-colors duration-300 hover:border-gold hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Media library"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2px] border border-white/25 bg-[#141417] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-4 border-b border-white/15 px-5 py-4">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-gold">Media Library</p>
            <h2 className="font-display text-lg font-medium text-paper">
              {accept === "video" ? "Select or upload a video" : "Select or upload an image"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close media library"
            className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-white/30 text-paper-dim transition-colors hover:border-seal hover:text-seal"
          >
            ✕
          </button>
        </header>

        <div className="flex gap-2 border-b border-white/15 px-5 py-3">
          <button
            type="button"
            onClick={() => setTab("library")}
            className={`rounded-[2px] border px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 ${
              tab === "library" ? "border-gold/80 bg-gold/15 text-gold" : "border-white/25 text-[#cfcbc2] hover:text-paper"
            }`}
          >
            Library ({media.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={`rounded-[2px] border px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 ${
              tab === "upload" ? "border-gold/80 bg-gold/15 text-gold" : "border-white/25 text-[#cfcbc2] hover:text-paper"
            }`}
          >
            Upload New
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {msg ? <p className="mb-4 border border-seal/40 bg-seal/10 px-4 py-2 text-sm text-[#d98a8e]">{msg}</p> : null}

          {tab === "library" ? (
            loading ? (
              <p className="text-sm text-[#8f8a7f]">Loading library…</p>
            ) : media.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <p className="text-sm text-[#cfcbc2]">No {accept === "video" ? "videos" : "images"} in the library yet.</p>
                <button type="button" className={btn} onClick={() => setTab("upload")}>
                  Upload from your computer
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {media.map((item) => (
                  <div key={item.url} className="group relative overflow-hidden rounded-[2px] border border-white/20 bg-[#1e1e23]">
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(item.url);
                        onClose();
                      }}
                      className={`flex w-full flex-col ${item.type === "video" ? "aspect-video" : "aspect-square"}`}
                    >
                      {item.type === "video" ? (
                        <video src={item.url} muted className="h-full w-full object-cover" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                      )}
                      <span className="border-t border-white/10 bg-[#19191d] px-2.5 py-2 text-left">
                        <span className="block truncate text-[0.68rem] text-[#cfcbc2]">{item.name}</span>
                        <span className="block text-[0.58rem] text-[#8f8a7f]">
                          {fmtSize(item.size)} · {fmtDate(item.modified)}
                        </span>
                      </span>
                    </button>
                    {item.url === initialUrl ? (
                      <span className="absolute left-2 top-2 rounded-[2px] bg-gold px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.14em] text-ink">
                        In use
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => del(item)}
                      aria-label={`Delete ${item.name}`}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-[2px] border border-white/30 bg-black/70 text-[0.7rem] text-paper opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:!border-seal hover:!text-seal"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-[2px] border-2 border-dashed border-white/30 bg-[#1a1a1f] text-[#cfcbc2] transition-colors duration-300 hover:border-gold/70 hover:text-paper"
              >
                <span className="text-2xl">⬆</span>
                <span className="text-sm font-medium">
                  {file ? `Selected: ${file.name}` : `Click to choose ${accept === "video" ? "a video" : "an image"} from your computer`}
                </span>
                <span className="text-[0.65rem] text-[#8f8a7f]">
                  {accept === "video" ? "MP4 / WebM / MOV — up to 30MB" : "JPG / PNG / WebP / AVIF / GIF / SVG — up to 30MB"}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={accept === "video" ? "video/mp4,video/webm,video/mov" : "image/*"}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setFile(f ?? null);
                  setMsg("");
                }}
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[#8f8a7f]">
                  {file ? `${file.name} · ${fmtSize(file.size)}` : "No file selected yet."}
                </span>
                <button type="button" disabled={!file || busy} className={btn} onClick={doUpload}>
                  {busy ? "Uploading…" : "Upload & Use"}
                </button>
              </div>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between border-t border-white/15 px-5 py-3">
          <span className="text-[0.62rem] uppercase tracking-[0.2em] text-[#8f8a7f]">
            Files appear in /uploads and on the live site instantly.
          </span>
          <button type="button" className={btn} onClick={onClose}>
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
}