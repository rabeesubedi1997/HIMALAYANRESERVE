import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { seoDefault, type ContentShape } from "@/lib/content";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import StatsStrip from "@/components/sections/StatsStrip";
import PressMarquee from "@/components/sections/PressMarquee";
import CrownCollections from "@/components/sections/CrownCollections";
import Craft from "@/components/sections/Craft";
import Packaging from "@/components/sections/Packaging";
import Dubai from "@/components/sections/Dubai";
import AllocationForm from "@/components/sections/AllocationForm";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const seo = (settings.seo ?? seoDefault) as Record<string, unknown>;

  return {
    title: String(seo.title ?? seoDefault.title),
    description: String(seo.description ?? seoDefault.description),
    keywords: String(seo.keywords ?? seoDefault.keywords),
    metadataBase: new URL("https://himalayanreserve.coffee"),
    openGraph: {
      title: String(seo.ogTitle ?? seoDefault.ogTitle),
      description: String(seo.ogDescription ?? seoDefault.ogDescription),
      images: seo.ogImage ? [{ url: String(seo.ogImage) }] : undefined,
      type: "website",
      locale: "en_US",
    },
    robots: seo.noindex ? { index: false, follow: false } : undefined,
  };
}

export default async function Home() {
  const settings = await getSettings();
  const hero = settings.hero as ContentShape["hero"];
  const stats = settings.stats as ContentShape["stats"];
  const press = settings.press as ContentShape["press"];
  const ancestral = settings.ancestral as ContentShape["ancestral"];
  const civet = settings.civet as ContentShape["civet"];
  const craft = settings.craft as ContentShape["craft"];
  const packaging = settings.packaging as ContentShape["packaging"];
  const dubai = settings.dubai as ContentShape["dubai"];
  const nav = settings.nav as ContentShape["nav"];
  const footer = settings.footer as ContentShape["footer"];
  const media = settings.media as ContentShape["media"];

  return (
    <>
      <Navbar nav={nav} />
      <main>
        <Hero data={hero} media={media} />
        <StatsStrip stats={stats} />
        <PressMarquee press={press} />
        <CrownCollections ancestral={ancestral} civet={civet} media={{ ancestral: media.ancestral, civet: media.civet }} />
        <Craft data={craft} media={media.craft} />
        <Packaging data={packaging} media={media} />
        <Dubai data={dubai} media={media} />
        <AllocationForm contact={footer} />
      </main>
      <Footer data={footer} nav={nav} />
    </>
  );
}