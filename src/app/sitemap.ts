import type { MetadataRoute } from "next";

import { DOCS } from "@/docs/docs";
import { SITE_URL } from "@/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    ...Object.keys(DOCS).map((slug) => ({
      url: `${SITE_URL}/docs/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
