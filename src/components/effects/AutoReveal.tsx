"use client";

import { useEffect } from "react";

export default function AutoReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    const els = document.querySelectorAll(".reveal:not(.is-visible)");
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}