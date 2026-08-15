import type { MetadataRoute } from "next";

import { content } from "@/content";
import { locales } from "@/i18n/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [contact, lots] = await Promise.all([content.getContact(), content.getLots()]);
  const base = contact.siteUrl.replace(/\/$/, "");
  const lastModified = new Date();

  const home = locales.map((locale) => ({
    url: `${base}/${locale}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 1,
    alternates: {
      languages: Object.fromEntries(locales.map((code) => [code, `${base}/${code}`])),
    },
  }));

  const lotPages = locales.flatMap((locale) =>
    lots.map((lot) => ({
      url: `${base}/${locale}/cafe/${lot.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((code) => [code, `${base}/${code}/cafe/${lot.slug}`]),
        ),
      },
    })),
  );

  return [...home, ...lotPages];
}
