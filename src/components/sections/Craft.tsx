import Image from "next/image";
import type { ContentShape } from "@/lib/content";
import { SectionHeader } from "@/components/ui/Primitives";

type CraftProps = {
  data: ContentShape["craft"];
  media: Pick<ContentShape["media"], "craft">["craft"];
};

export default function Craft({ data, media }: CraftProps) {
  const glyphs = ["M", "✋", "🔥", "◎"];
  const craftImages = [media.terroir, media.handpick, media.firewood, media.jato];
  const pillars = data.pillars.map((p, i) => ({
    ...p,
    glyph: glyphs[i] ?? "◎",
    image: craftImages[i % craftImages.length],
  }));

  const gallery = [
    { image: media.terroir, caption: "1,700m Terroir" },
    { image: media.handpick, caption: "Handpicked by Master Elders" },
    { image: media.firewood, caption: "Himalayan Sun Drying" },
    { image: media.jato, caption: "Firewood Roasting" },
    { image: media.jato, caption: "Stone-Ground on Jato" },
    { image: media.terroir, caption: "Stone-Ground Powder" },
  ];

  return (
    <section id="craft" className="relative border-t border-white/5 bg-ink-soft/30 py-28 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeader
          eyebrow="The Ancestral Craft & Terroir"
          title={
            <>
              {data.headline.split(" ")[0]}{" "}
              <span className="gold-text">
                {data.headline.split(" ").slice(1).join(" ") || data.headline}
              </span>
            </>
          }
          sub={data.intro}
        />
        <p className="mt-6 text-center font-serif text-xl italic text-gold">{data.subheadline}</p>

        <div className="mt-16 grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <article key={p.title} className="group relative flex flex-col overflow-hidden bg-ink">
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="object-cover opacity-70 transition-all duration-[1600ms] [transition-timing-function:var(--ease-lux)] group-hover:scale-110 group-hover:opacity-90"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                <span className="absolute left-4 top-4 font-serif text-3xl text-gold/80">{p.glyph}</span>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <h3 className="font-display text-xl font-medium leading-snug text-paper">
                  {String(i + 1).padStart(2, "0")}. {p.title}
                </h3>
                <p className="text-sm leading-relaxed text-paper-dim">{p.text}</p>
                <span
                  aria-hidden
                  className="mt-auto h-px w-0 bg-gold transition-all duration-700 [transition-timing-function:var(--ease-lux)] group-hover:w-full"
                />
              </div>
            </article>
          ))}
        </div>

        <figure className="mt-20 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <blockquote className="flex flex-col gap-6">
            <span className="eyebrow text-gold">10 Months of Himalayan Patience</span>
            <p className="font-display text-4xl font-medium leading-tight text-paper md:text-5xl">
              {data.patience.big}{" "}
              <span className="italic text-paper-dim">{data.patience.title}</span>
            </p>
            <p className="max-w-xl text-base leading-relaxed text-paper-dim">{data.patience.text}</p>
          </blockquote>
          <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {gallery.map((g, i) => (
              <figure key={i} className="group relative h-80 w-64 shrink-0 overflow-hidden">
                <Image
                  src={g.image}
                  alt={g.caption}
                  fill
                  sizes="256px"
                  className="object-cover transition-transform duration-[1800ms] [transition-timing-function:var(--ease-lux)] group-hover:scale-110"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/85 to-transparent" />
                <figcaption className="absolute bottom-4 left-4 right-4 font-serif text-lg italic text-paper">
                  {g.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </figure>
      </div>
    </section>
  );
}