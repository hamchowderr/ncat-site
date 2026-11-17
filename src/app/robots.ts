import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Preview deployments stay out of search results; only production is indexed.
  const indexable = process.env.VERCEL_ENV === undefined || process.env.VERCEL_ENV === "production";
  return { rules: indexable ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" }, sitemap: `${siteUrl}/sitemap.xml` };
}
