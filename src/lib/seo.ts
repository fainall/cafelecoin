import { instagramUrl } from "@/content/helpers";
import type { Contact, Estate, Lot } from "@/content/schema";
import { translate, type Locale } from "@/i18n/config";

/** Datos estructurados de la organización (schema.org/Organization). */
export function organizationJsonLd(contact: Contact, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: contact.legalName,
    alternateName: contact.brand,
    url: `${contact.siteUrl}/${locale}`,
    email: contact.email,
    sameAs: [instagramUrl(contact)],
    contactPoint: contact.phones.map((phone) => ({
      "@type": "ContactPoint",
      telephone: `+${phone.e164}`,
      contactType: "sales",
      areaServed: translate(phone.region, locale),
      availableLanguage: ["es", "en"],
    })),
  };
}

/** Datos estructurados de un lote (schema.org/Product). */
export function lotJsonLd(lot: Lot, estate: Estate, contact: Contact, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: lot.name,
    description: translate(lot.summary, locale),
    brand: { "@type": "Brand", name: contact.brand },
    category: "Coffee",
    url: `${contact.siteUrl}/${locale}/cafe/${lot.slug}`,
    countryOfOrigin: estate.country,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: locale === "en" ? "Altitude" : "Altitud",
        value: `${lot.altitudeMasl} masl`,
      },
      {
        "@type": "PropertyValue",
        name: locale === "en" ? "Process" : "Beneficio",
        value: translate(lot.processLabel, locale),
      },
      {
        "@type": "PropertyValue",
        name: locale === "en" ? "Varieties" : "Variedades",
        value: lot.varieties.join(", "),
      },
      ...(lot.sensory.scaScore
        ? [
            {
              "@type": "PropertyValue",
              name: "SCA",
              value: String(lot.sensory.scaScore),
            },
          ]
        : []),
    ],
  };
}
