import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://himalayanreserve.coffee",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}