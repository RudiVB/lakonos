import type { MetadataRoute } from "next";

// If the custom domain isn't live yet, change this to "https://lakonos.vercel.app"
const SITE = "https://lakonos.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/portal", "/api"], // keep private areas out of search results
    },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
