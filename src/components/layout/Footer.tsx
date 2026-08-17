"use client";

import { useEffect, useState } from "react";
import type { ContentShape } from "@/lib/content";

export default function Footer({
  data,
  nav,
}: {
  data: ContentShape["footer"];
  nav: ContentShape["nav"];
}) {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <footer className="relative border-t hairline-gold bg-ink-soft/40">
      <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-5">
            <a href="#home" className="font-display text-xl font-semibold tracking-[0.32em] text-paper">
              HIMALAYAN <span className="gold-text">RESERVE</span>
            </a>
            <p className="max-w-sm font-serif text-lg italic leading-relaxed text-paper-dim">
              {data.tagline}
            </p>
            <p className="max-w-sm text-xs leading-relaxed tracking-wide text-paper-faint">
              {data.footline}
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-3">
            <span className="eyebrow !text-[0.6rem] text-gold-dim">Explore</span>
            {nav.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="w-fit text-sm text-paper-dim transition-colors duration-300 hover:text-gold"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-3">
            <span className="eyebrow !text-[0.6rem] text-gold-dim">Nepal Estate</span>
            <p className="text-sm leading-relaxed text-paper-dim">{data.nepalEstate}</p>
            <span className="eyebrow mt-4 !text-[0.6rem] text-gold-dim">Dubai Partner</span>
            <p className="text-sm leading-relaxed text-paper-dim">{data.dubaiPartner}</p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="eyebrow !text-[0.6rem] text-gold-dim">Contact</span>
            <a
              href={`mailto:${data.email}`}
              className="w-fit text-sm text-paper-dim transition-colors duration-300 hover:text-gold"
            >
              {data.email}
            </a>
            <a
              href={`https://wa.me/${data.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit text-sm text-paper-dim transition-colors duration-300 hover:text-gold"
            >
              WhatsApp Concierge
            </a>
            <a
              href="#allocation"
              className="mt-2 w-fit border border-gold/60 px-4 py-2 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-gold transition-all duration-500 hover:bg-gold hover:text-ink"
            >
              Apply for Allocation
            </a>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center">
          <p className="text-xs text-paper-faint">{data.copyright}</p>
          <p className="text-xs text-paper-faint">{data.legalName}</p>
          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            aria-label="Back to top"
            className={`group flex items-center gap-3 border border-white/15 px-5 py-3 text-[0.65rem] uppercase tracking-[0.24em] text-paper-dim transition-all duration-500 hover:border-gold hover:text-gold ${
              showTop ? "" : "opacity-60"
            }`}
          >
            Top
            <span aria-hidden className="transition-transform duration-500 group-hover:-translate-y-1">
              ↑
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}