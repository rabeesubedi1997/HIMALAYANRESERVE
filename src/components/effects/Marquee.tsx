"use client";

type MarqueeProps = {
  items: readonly string[];
  className?: string;
  speed?: number;
};

export default function Marquee({ items, className = "", speed = 46 }: MarqueeProps) {
  const row = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-10 pr-10">
      {items.map((item, i) => (
        <span
          key={i}
          className="flex items-center gap-10 whitespace-nowrap font-serif text-xl italic tracking-wide text-paper-dim md:text-2xl"
        >
          {item}
          <span className="ml-10 inline-block h-1.5 w-1.5 rotate-45 bg-gold/60" aria-hidden />
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={`group relative overflow-hidden border-y border-white/5 py-6 ${className}`}
      style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}
    >
      <div
        className="flex w-max animate-marquee group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${speed}s` }}
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}