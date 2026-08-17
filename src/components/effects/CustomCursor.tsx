"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;
    let visible = false;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        ring.style.opacity = "1";
        dot.style.opacity = "1";
      }
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const interactive = t.closest("a, button, [role='button'], input, select, textarea, label");
      ring.classList.toggle("scale-150", !!interactive);
      ring.classList.toggle("border-gold", !!interactive);
    };

    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate3d(${rx - 20}px, ${ry - 20}px, 0)`;
      dot.style.transform = `translate3d(${mx - 2}px, ${my - 2}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    const onLeave = () => {
      visible = false;
      ring.style.opacity = "0";
      dot.style.opacity = "0";
    };

    raf = requestAnimationFrame(loop);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="fixed left-0 top-0 z-[120] h-10 w-10 -translate-x-20 -translate-y-20 rounded-full border border-white/30 opacity-0 transition-[border-color] duration-300 [transition-timing-function:var(--ease-lux)]"
        style={{ pointerEvents: "none" }}
      />
      <div
        ref={dotRef}
        aria-hidden
        className="fixed left-0 top-0 z-[120] h-1 w-1 rounded-full bg-gold opacity-0"
        style={{ pointerEvents: "none" }}
      />
    </>
  );
}