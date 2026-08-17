"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SCHEMAS } from "./AdminDashboard";

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const onMedia = pathname.startsWith("/admin/media");
  const section = params.get("section") ?? "seo";

  return (
    <aside className="hidden w-60 shrink-0 flex-col overflow-y-auto border-r border-white/15 bg-[#131316] md:flex">
      <nav aria-label="Admin sections" className="flex flex-col gap-1 p-3">
        <span className="px-3.5 pb-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[#8f8a7f]">
          Content
        </span>
        {SCHEMAS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => router.push(`/admin?section=${s.key}`)}
            className={`flex items-center gap-3 rounded-[2px] border-l-2 px-3.5 py-2.5 text-left text-[0.72rem] font-semibold uppercase tracking-[0.12em] transition-all duration-300 ${
              !onMedia && section === s.key
                ? "border-gold bg-gold/[0.14] text-gold"
                : "border-transparent text-[#cfcbc2] hover:bg-white/[0.06] hover:text-paper"
            }`}
          >
            <span aria-hidden className="text-sm leading-none text-gold">
              {s.icon}
            </span>
            {s.title}
          </button>
        ))}
      </nav>
      <div className="mt-4 flex flex-col gap-1 border-t border-white/15 p-3 pt-4">
        <span className="px-3.5 pb-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[#8f8a7f]">
          Assets
        </span>
        <button
          type="button"
          onClick={() => router.push("/admin/media")}
          className={`flex items-center gap-3 rounded-[2px] border-l-2 px-3.5 py-2.5 text-left text-[0.72rem] font-semibold uppercase tracking-[0.12em] transition-all duration-300 ${
            onMedia
              ? "border-gold bg-gold/[0.14] text-gold"
              : "border-transparent text-[#cfcbc2] hover:bg-white/[0.06] hover:text-paper"
          }`}
        >
          <span aria-hidden className="text-sm leading-none text-gold">
            🖼
          </span>
          Media Library
        </button>
        <p className="px-3.5 pt-2 text-[0.6rem] uppercase tracking-[0.2em] text-[#8f8a7f]">
          {SCHEMAS.length} editable sections
        </p>
      </div>
    </aside>
  );
}

export function AdminMobileStrip() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const onMedia = pathname.startsWith("/admin/media");
  const section = params.get("section") ?? "seo";

  return (
    <div className="flex gap-2 overflow-x-auto border-b border-white/15 bg-[#151518] px-4 py-3 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {SCHEMAS.map((s) => (
        <button
          key={s.key}
          type="button"
          onClick={() => router.push(`/admin?section=${s.key}`)}
          className={`shrink-0 whitespace-nowrap rounded-[2px] border px-3 py-1.5 text-[0.64rem] font-semibold uppercase tracking-[0.12em] transition-colors duration-300 ${
            !onMedia && section === s.key
              ? "border-gold/80 bg-gold/15 text-gold"
              : "border-white/25 text-[#cfcbc2] hover:text-paper"
          }`}
        >
          {s.title}
        </button>
      ))}
      <button
        type="button"
        onClick={() => router.push("/admin/media")}
        className={`shrink-0 whitespace-nowrap rounded-[2px] border px-3 py-1.5 text-[0.64rem] font-semibold uppercase tracking-[0.12em] transition-colors duration-300 ${
          onMedia ? "border-gold/80 bg-gold/15 text-gold" : "border-gold/60 bg-gold/10 text-gold"
        }`}
      >
        🖼 Media Library
      </button>
    </div>
  );
}