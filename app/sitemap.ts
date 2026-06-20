import type { MetadataRoute } from "next";

// If the custom domain isn't live yet, change this to "https://lakonos.vercel.app"
const SITE = "https://lakonos.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE}/case-study`, lastModified: now, changeFrequency: "yearly", priority: 0.8 },
    { url: `${SITE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
