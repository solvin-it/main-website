import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://solvin.co";
  return ["", "/work", "/capabilities", "/readiness", "/about", "/contact", "/privacy"].map(path => ({
    url: `${base}${path}`, lastModified: new Date(), changeFrequency: path === "" ? "weekly" : "monthly", priority: path === "" ? 1 : .8,
  }));
}
