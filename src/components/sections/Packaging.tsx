import Image from "next/image";
import type { ContentShape } from "@/lib/content";
import { SectionHeader } from "@/components/ui/Primitives";

type PackagingProps = {
  data: ContentShape["packaging"];
  media: Pick<ContentShape["media"], "packaging">;
};

export default function Packaging({ data, media }: PackagingProps) {
  return (
    <section id="packaging" className="relative py-28 md:py-36">
      <div className="mx-auto grid max-w-[1400px] items-center gap-14 px-6 lg:grid-cols-2 lg:gap-20 lg:px-10">
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={media.packaging}
              alt="Handcrafted Royal Box in 90% wild Lokta paper with Royal Wax Seal"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <div className="absolute inset-4 border hairline-gold" aria-hidden />
          </div>

          <div
            aria-hidden
            className="absolute -bottom-8 -right-4 flex h-28 w-28 items-center justify-center rounded-full border border-gold/40 bg-ink shadow-[0_0_50px_rgba(212,175,55,0.15)] md:-right-8 md:h-36 md:w-36"
          >
            <svg viewBox="0 0 100 100" className="h-3/5 w-3/5 -rotate-6" aria-hidden>
              <circle cx="50" cy="50" r="47" fill="none" stroke="#8E1F22" strokeWidth="2.5" opacity="0.7" />
              <circle cx="50" cy="50" r="41" fill="#8E1F22" opacity="0.12" />
              <text
                x="50"
                y="58"
                textAnchor="middle"
                fontSize="17"
                letterSpacing="2"
                fontFamily="Playfair Display, serif"
                fill="#B94A4E"
              >
                HR
              </text>
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <SectionHeader
            align="left"
            eyebrow="Eco-Luxury Packaging Commitment"
            title={
              <>
                {data.headline.split(" ").slice(0, -1).join(" ")}{" "}
                <span className="italic text-gold">{data.headline.split(" ").slice(-1)}</span>
              </>
            }
            sub={data.intro}
          />
          <p className="lokta-texture max-w-xl border border-white/10 p-6 text-sm leading-relaxed text-paper-dim">
            {data.box}
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              "CO₂-Neutral Biodegradable Pouch",
              "90% Wild Lokta Paper — Banknote-Grade",
              "10% Upcycled Kaskikot Coffee Remnants",
              "Hand-Stamped Royal Wax Seal",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 border border-white/10 px-4 py-3 text-sm text-paper-dim">
                <span className="h-1.5 w-1.5 rotate-45 bg-gold" aria-hidden /> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}