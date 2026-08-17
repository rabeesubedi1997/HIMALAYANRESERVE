"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ParallaxProps = {
  children: ReactNode;
  speed?: number;
  className?: string;
};

export default function Parallax({ children, speed = -0.12, className = "" }: ParallaxProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let current = 0;
    let target = 0;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
      target = progress * speed * 100;
    };

    const loop = () => {
      current += (target - current) * 0.08;
      el.style.transform = `translate3d(0, ${current.toFixed(2)}%, 0)`;
      raf = requestAnimationFrame(loop);
    };

    onScroll();
    raf = requestAnimationFrame(loop);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}