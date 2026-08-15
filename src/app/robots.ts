import type { MetadataRoute } from "next";

import { content } from "@/content";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const contact = await content.getContact();
  const base = contact.siteUrl.replace(/\/$/, "");

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
