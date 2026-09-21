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

  // La tienda es la página que vende: sin ella en el sitemap, Google solo la
  // encuentra si sigue un enlace, y hasta ahora no lo había hecho. El checkout
  // queda fuera a propósito — es noindex.
  const shop = locales.map((locale) => ({
    url: `${base}/${locale}/tienda`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.9,
    alternates: {
      languages: Object.fromEntries(locales.map((code) => [code, `${base}/${code}/tienda`])),
    },
  }));

  return [...home, ...shop, ...lotPages];
}
