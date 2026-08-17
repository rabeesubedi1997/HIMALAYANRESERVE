import Counter from "@/components/effects/Counter";
import type { ContentShape } from "@/lib/content";

export default function StatsStrip({ stats }: { stats: ContentShape["stats"] }) {
  return (
    <section aria-label="Facts" className="border-y border-white/5 bg-ink-soft/40">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-10 px-6 py-16 lg:grid-cols-4 lg:px-10">
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col gap-3 border-l hairline-gold pl-6">
            <Counter value={stat.value} suffix={stat.suffix} label={stat.label} />
          </div>
        ))}
      </div>
    </section>
  );
}