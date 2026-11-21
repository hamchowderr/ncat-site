import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/pricing", "/about"].map((path) => ({ url: `${siteUrl}${path}`, changeFrequency: "weekly", priority: path ? 0.8 : 1 }));
}
