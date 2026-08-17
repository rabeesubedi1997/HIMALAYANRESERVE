import Image from "next/image";
import type { ContentShape } from "@/lib/content";
import Button from "@/components/ui/Button";

type DubaiProps = {
  data: ContentShape["dubai"];
  media: Pick<ContentShape["media"], "burj">;
};

export default function Dubai({ data, media }: DubaiProps) {
  return (
    <section id="dubai" className="relative overflow-hidden border-t border-white/5 py-28 md:py-36">
      <div className="absolute inset-0">
        <Image
          src={media.burj}
          alt="Dubai skyline at dusk"
          fill
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-ink via-ink/80 to-ink" />
      </div>

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-14 px-6 lg:grid-cols-2 lg:gap-20 lg:px-10">
        <div className="flex flex-col gap-8">
          <span className="eyebrow text-gold">The Dubai Exclusive Destination</span>
          <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-paper md:text-6xl">
            {data.headline}
          </h2>
          <p className="max-w-xl text-lg leading-relaxed text-paper-dim">{data.subheadline}</p>
          <p className="max-w-xl text-base leading-relaxed text-paper-dim">{data.text}</p>

          <div className="flex flex-col gap-3 border border-white/10 bg-ink/60 p-6 backdrop-blur-sm">
            <span className="eyebrow !text-[0.6rem] text-gold-dim">Location</span>
            <p className="font-serif text-xl italic text-paper">{data.location}</p>
            <a
              href={data.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 border-b border-gold/60 pb-1 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-gold transition-colors duration-500 hover:border-gold hover:text-paper"
            >
              View on Map →
            </a>
          </div>

          <Button href="#allocation" variant="ghost">
            Reserve Your Visit
          </Button>
        </div>

        <div className="relative hidden aspect-[4/5] overflow-hidden lg:block">
          <Image
            src={media.burj}
            alt="Burj Khalifa, the world's tallest building"
            fill
            sizes="50vw"
            className="object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 border border-white/10 bg-ink/70 p-6 backdrop-blur-md">
            <span className="font-display text-3xl font-medium text-gold">442m</span>
            <p className="mt-1 text-sm text-paper-dim">
              Level 122 — the world&apos;s highest lounge, where Himalayan Reserve is served.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}