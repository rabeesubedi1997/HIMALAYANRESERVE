import type { ReactNode } from "react";

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`eyebrow ${className}`}>{children}</span>;
}

export function SectionHeader({
  eyebrow,
  title,
  sub,
  className = "",
  align = "center",
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
  className?: string;
  align?: "center" | "left";
}) {
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <header className={`flex flex-col gap-4 ${alignCls} ${className}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-paper md:text-6xl">
        {title}
      </h2>
      {sub ? <p className="max-w-2xl text-base leading-relaxed text-paper-dim md:text-lg">{sub}</p> : null}
    </header>
  );
}