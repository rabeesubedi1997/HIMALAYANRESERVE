const ldJson = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Himalayan Reserve Coffee Pvt. Ltd.",
      url: "https://himalayanreserve.coffee",
      email: "contact@himalayanreserve.coffee",
      slogan: "From the Roof of the World to the Top of the Sky.",
      location: [
        { "@type": "Place", name: "Nepal Estate", address: "Kaskikot, Kaski, Annapurna Region, Nepal" },
        {
          "@type": "Place",
          name: "Dubai Partner",
          address: "At.mosphere Lounge, Level 122, Burj Khalifa, Dubai, UAE",
        },
      ],
    },
    {
      "@type": "Product",
      name: "Ancestral Single-Estate Edition",
      description:
        "100% handpicked, firewood-roasted and stone-ground coffee cultivated at 1,700m in Kaskikot, Nepal.",
      url: "https://himalayanreserve.coffee",
      offers: [
        { "@type": "Offer", name: "100g Royal Gift Box", price: 149, priceCurrency: "AED" },
        { "@type": "Offer", name: "250g Executive Master Box", price: 399, priceCurrency: "AED" },
        { "@type": "Offer", name: "1kg Barista Reserve", price: 1200, priceCurrency: "AED" },
      ],
    },
    {
      "@type": "Product",
      name: "Wild Civet Reserve",
      description:
        "The world's most expensive and rare Himalayan coffee, forest-sourced by wild free-roaming Himalayan civets at 1,700m.",
      url: "https://himalayanreserve.coffee",
      offers: [
        { "@type": "Offer", name: "100g Crown Box", price: 999, priceCurrency: "AED" },
        { "@type": "Offer", name: "250g Crown Box", price: 1999, priceCurrency: "AED" },
        { "@type": "Offer", name: "1 Cup Brewed", price: 500, priceCurrency: "AED" },
      ],
    },
  ],
} as const;

export default function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson).replace(/</g, "\\u003c") }}
    />
  );
}