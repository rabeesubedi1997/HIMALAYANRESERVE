"use client";

import { useState } from "react";
import Image from "next/image";
import type { ContentShape, Currency } from "@/lib/content";

function TastingGrid({
  tasting,
}: {
  tasting: readonly { name: string; value: string }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
      {tasting.map((t) => (
        <div key={t.name} className="bg-ink-soft p-5 transition-colors duration-500 hover:bg-ink-lift">
          <span className="eyebrow !text-[0.6rem] text-gold-dim">{t.name}</span>
          <span className="mt-2 block font-serif text-xl italic leading-snug text-paper">{t.value}</span>
        </div>
      ))}
    </div>
  );
}

function PriceRow({
  tier,
  currency,
}: {
  tier: { label: string; price: Record<Currency, number>; featured: boolean };
  currency: Currency;
}) {
  const featured = Boolean(tier.featured);
  return (
    <li
      className={`flex items-center justify-between gap-4 border px-5 py-4 transition-colors duration-500 ${
        featured ? "border-gold/40 bg-gold/[0.06]" : "border-white/10 hover:border-gold/30"
      }`}
    >
      <span className="text-sm text-paper-dim">{tier.label}</span>
      <span className="shrink-0 text-right">
        <span className="font-display text-xl font-semibold text-gold">
          {currency === "AED" ? "AED " : currency === "USD" ? "$" : "NPR "}
          {tier.price[currency].toLocaleString("en-US")}
        </span>
        {featured ? (
          <span className="block text-[0.6rem] uppercase tracking-[0.2em] text-gold-dim">Most Allocated</span>
        ) : null}
      </span>
    </li>
  );
}

function CollectionCard({
  collection,
  badge,
  image,
  imageAlt,
  elevation,
  meta,
  cta,
  ctaHref,
  currency,
  accent,
}: {
  collection: {
    name: string;
    tagline: string;
    description: string;
    tasting: readonly { name: string; value: string }[];
    tiers: readonly { label: string; price: Record<Currency, number>; featured: boolean }[];
  };
  badge?: string;
  image: string;
  imageAlt: string;
  elevation: string;
  meta: string;
  cta: string;
  ctaHref: string;
  currency: Currency;
  accent?: boolean;
}) {
  return (
    <article
      className={`group flex flex-col overflow-hidden border bg-ink-soft/60 transition-all duration-700 [transition-timing-function:var(--ease-lux)] ${
        accent
          ? "border-gold/40 shadow-[0_0_60px_rgba(212,175,55,0.07)] lg:mt-10"
          : "border-white/10 lg:mt-0"
      }`}
    >
      <div className="relative h-72 overflow-hidden md:h-96">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-[1800ms] [transition-timing-function:var(--ease-lux)] group-hover:scale-110"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-soft via-ink/20 to-transparent" />
        {badge ? (
          <span className="absolute left-5 top-5 max-w-[85%] border border-gold/50 bg-ink/70 px-4 py-2 text-[0.6rem] font-medium uppercase tracking-[0.22em] text-gold backdrop-blur-sm">
            {badge}
          </span>
        ) : null}
        <h3 className="absolute bottom-5 left-5 right-5 font-display text-3xl font-medium text-paper md:text-4xl">
          {collection.name}
        </h3>
      </div>

      <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
        <p className="eyebrow">{collection.tagline}</p>
        <p className="text-sm leading-relaxed text-paper-dim">{collection.description}</p>

        <TastingGrid tasting={collection.tasting} />

        <dl className="space-y-2 border-l hairline-gold pl-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="pt-1 text-[0.65rem] uppercase tracking-[0.18em] text-paper-faint">Elevation</dt>
            <dd className="text-right text-paper-dim">{elevation}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="pt-1 text-[0.65rem] uppercase tracking-[0.18em] text-paper-faint">
              {accent ? "Rarity" : "Harvest"}
            </dt>
            <dd className="text-right text-paper-dim">{meta}</dd>
          </div>
        </dl>

        <ul className="flex flex-col gap-2">
          {collection.tiers.map((tier) => (
            <PriceRow key={tier.label} tier={tier} currency={currency} />
          ))}
        </ul>

        <a
          href={ctaHref}
          className="group/cta mt-auto inline-flex w-fit items-center gap-3 border-b border-gold/60 pb-1 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-gold transition-colors duration-500 hover:border-gold hover:text-paper"
        >
          {cta}
          <span aria-hidden className="transition-transform duration-500 group-hover/cta:translate-x-1.5">
            →
          </span>
        </a>
      </div>
    </article>
  );
}

function CurrencyToggle({
  currency,
  onChange,
}: {
  currency: Currency;
  onChange: (c: Currency) => void;
}) {
  const options: Currency[] = ["AED", "USD", "NPR"];
  return (
    <div role="tablist" aria-label="Currency" className="flex border border-white/15">
      {options.map((c) => (
        <button
          key={c}
          role="tab"
          aria-selected={currency === c}
          onClick={() => onChange(c)}
          className={`px-5 py-2.5 text-[0.7rem] font-medium uppercase tracking-[0.2em] transition-all duration-300 ${
            currency === c ? "bg-gold text-ink" : "text-paper-dim hover:text-paper"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

export default function CrownCollections({
  ancestral,
  civet,
  media,
}: {
  ancestral: ContentShape["ancestral"];
  civet: ContentShape["civet"];
  media: { ancestral: string; civet: string };
}) {
  const [currency, setCurrency] = useState<Currency>("AED");

  return (
    <section id="collections" className="relative py-28 md:py-36">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <header className="flex flex-col gap-4">
            <span className="eyebrow reveal">Our 2 Royal Collections</span>
            <h2 className="reveal font-display text-4xl font-semibold leading-[1.05] tracking-tight text-paper md:text-6xl" data-reveal-delay="2">
              The Crown Collections
            </h2>
            <p className="reveal max-w-md text-base text-paper-dim" data-reveal-delay="3">
              Two extraordinary micro-lots. One unrivaled origin.
            </p>
          </header>
          <CurrencyToggle currency={currency} onChange={setCurrency} />
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          <CollectionCard
            collection={ancestral}
            image={media.ancestral}
            imageAlt={ancestral.name}
            elevation={ancestral.elevation}
            meta={ancestral.harvest}
            cta={ancestral.cta}
            ctaHref="#dubai"
            currency={currency}
          />
          <CollectionCard
            collection={civet}
            accent
            badge={civet.badge}
            image={media.civet}
            imageAlt={civet.name}
            elevation={civet.elevation}
            meta={civet.rarity}
            cta={civet.cta}
            ctaHref="#allocation"
            currency={currency}
          />
        </div>
      </div>
    </section>
  );
}