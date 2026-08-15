import type { Metadata } from "next";
import { Archivo, Newsreader } from "next/font/google";
import { notFound } from "next/navigation";

import "../globals.css";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { content } from "@/content";
import { getPrimaryPhone, sampleRequestMessage, whatsappUrl } from "@/content/helpers";
import { getDictionary } from "@/i18n";
import { isLocale, locales, localeTags, type Locale } from "@/i18n/config";
import { organizationJsonLd } from "@/lib/seo";

/** Serif editorial con tamaño óptico: titulares y textos de lectura. */
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

/** Grotesca neutra para navegación, etiquetas, datos y formularios. */
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};

  const locale: Locale = raw;
  const dictionary = getDictionary(locale);
  const contact = await content.getContact();

  return {
    metadataBase: new URL(contact.siteUrl),
    title: {
      default: dictionary.meta.homeTitle,
      template: `%s · ${contact.brand}`,
    },
    description: dictionary.meta.homeDescription,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(locales.map((code) => [localeTags[code], `/${code}`])),
    },
    openGraph: {
      type: "website",
      siteName: contact.legalName,
      title: dictionary.meta.homeTitle,
      description: dictionary.meta.homeDescription,
      locale: localeTags[locale],
      url: `/${locale}`,
    },
    twitter: {
      card: "summary_large_image",
      title: dictionary.meta.homeTitle,
      description: dictionary.meta.homeDescription,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const dictionary = getDictionary(locale);
  const [contact, estate] = await Promise.all([content.getContact(), content.getEstate()]);
  const phone = getPrimaryPhone(contact);
  const whatsapp = whatsappUrl(phone, sampleRequestMessage(locale));

  const navItems = [
    { href: "#historia", label: dictionary.nav.story },
    { href: "#origen", label: dictionary.nav.origin },
    { href: "#portafolio", label: dictionary.nav.portfolio },
    { href: "#exportacion", label: dictionary.nav.export },
    { href: "#contacto", label: dictionary.nav.contact },
  ];

  return (
    <html
      lang={localeTags[locale]}
      className={`${newsreader.variable} ${archivo.variable}`}
    >
      <body className="bg-ink text-bone antialiased">

        <SiteHeader
          locale={locale}
          brand={contact.brand}
          items={navItems}
          ctaLabel={dictionary.nav.cta}
          ctaHref={whatsapp}
          menuLabel={dictionary.nav.menu}
          skipLabel={dictionary.nav.skipToContent}
        />

        <main id="contenido">{children}</main>

        <SiteFooter locale={locale} dictionary={dictionary} contact={contact} estate={estate} />
        <WhatsAppFab href={whatsapp} label="WhatsApp" />

        <script
          type="application/ld+json"
          // El JSON-LD se genera desde la capa de contenido, no hay entrada de usuario.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd(contact, locale)),
          }}
        />
      </body>
    </html>
  );
}
