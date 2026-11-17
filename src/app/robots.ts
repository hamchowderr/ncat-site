import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/**
 * Search engines may index the site only on the production deployment of a chosen
 * domain (NEXT_PUBLIC_SITE_URL set). Previews and the bare vercel.app address stay out.
 */
export function isIndexable(env: Record<string, string | undefined> = process.env) {
  return env.VERCEL_ENV === "production" && !!env.NEXT_PUBLIC_SITE_URL;
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: isIndexable() ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
