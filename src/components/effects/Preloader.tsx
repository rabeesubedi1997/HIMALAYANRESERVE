"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [hidden, setHidden] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const hide = () => setHidden(true);
    const timer = window.setTimeout(hide, 1900);
    window.addEventListener("load", hide, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", hide);
    };
  }, []);

  useEffect(() => {
    if (!hidden) return;
    const t = window.setTimeout(() => setGone(true), 700);
    return () => window.clearTimeout(t);
  }, [hidden]);

  if (gone) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-ink transition-opacity duration-700 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <span className="font-display text-2xl font-semibold tracking-[0.42em] text-paper md:text-3xl">
        HIMALAYAN <span className="gold-text">RESERVE</span>
      </span>
      <div className="h-px w-44 overflow-hidden bg-white/10">
        <div className="h-full w-full origin-left scale-x-0 animate-[loader_1.6s_var(--ease-lux)_forwards]" />
      </div>
      <style>{`@keyframes loader { to { transform: scaleX(1); } }`}</style>
    </div>
  );
}