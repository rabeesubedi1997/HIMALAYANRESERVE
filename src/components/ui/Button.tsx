import type { ReactNode } from "react";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "gold" | "ghost";
  className?: string;
};

export default function Button({ href, children, variant = "gold", className = "" }: ButtonProps) {
  const base =
    "group inline-flex items-center justify-center gap-3 px-8 py-4 text-[0.8rem] font-medium uppercase tracking-[0.22em] transition-all duration-500 [transition-timing-function:var(--ease-lux)]";
  const styles =
    variant === "gold"
      ? "bg-gold text-ink hover:bg-paper hover:shadow-[0_0_40px_rgba(212,175,55,0.35)]"
      : "border border-white/25 text-paper hover:border-gold hover:text-gold hover:shadow-[0_0_30px_rgba(212,175,55,0.12)]";

  return (
    <a href={href} className={`${base} ${styles} ${className}`}>
      <span>{children}</span>
      <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1.5">
        →
      </span>
    </a>
  );
}