import Button from "@/components/ui/Button";
import type { ContentShape } from "@/lib/content";

type HeroProps = {
  data: ContentShape["hero"];
  media: Pick<ContentShape["media"], "heroVideo" | "heroPoster">;
};

export default function Hero({ data, media }: HeroProps) {
  return (
    <section id="home" className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={media.heroPoster}
        aria-label="Kaskikot mist over the Annapurna range"
        className="absolute inset-0 h-full w-full scale-105 object-cover animate-[kenburns_36s_ease-out_infinite_alternate]"
      >
        <source src={media.heroVideo} type="video/mp4" />
      </video>

      <div aria-hidden className="absolute inset-0 bg-ink/40" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(11,11,11,0.5)_100%)]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-ink to-transparent" />

      <div className="relative mx-auto w-full max-w-[1400px] px-6 pb-24 pt-40 lg:px-10">
        <p className="reveal eyebrow mb-6 text-gold" data-reveal-delay="1">
          {data.eyebrow}
        </p>
        <h1
          className="reveal max-w-4xl font-display text-5xl font-medium leading-[1.05] tracking-tight text-paper md:text-7xl lg:text-8xl"
          data-reveal-delay="2"
        >
          {data.title}
          <span className="mt-2 block italic text-transparent bg-gradient-to-r from-gold via-[#f3e5b0] to-gold bg-clip-text">
            {data.titleAccent}
          </span>
        </h1>
        <p className="reveal mt-8 max-w-xl text-base leading-relaxed text-paper-dim md:text-lg" data-reveal-delay="3">
          {data.sub}
        </p>
        <div className="reveal mt-10 flex flex-wrap gap-4" data-reveal-delay="4">
          <Button href="#collections">{data.ctaPrimary}</Button>
          <Button href="#dubai" variant="ghost">
            {data.ctaSecondary}
          </Button>
        </div>
      </div>
    </section>
  );
}