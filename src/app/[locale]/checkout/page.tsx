import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Section, SectionHeading } from "@/components/ui/section";
import { getDictionary } from "@/i18n";
import { isLocale, locales, localeTags, type Locale } from "@/i18n/config";

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

  return {
    title: dictionary.checkout.title,
    description: dictionary.checkout.intro,
    alternates: {
      canonical: `/${locale}/checkout`,
      languages: Object.fromEntries(locales.map((code) => [localeTags[code], `/${code}/checkout`])),
    },
    // Una pantalla de compra no aporta nada en un buscador.
    robots: { index: false, follow: true },
  };
}

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;

  const dictionary = getDictionary(locale);

  return (
    <Section tone="dark" className="pt-36 sm:pt-40">
      <SectionHeading eyebrow={dictionary.checkout.eyebrow} title={dictionary.checkout.title} />
      <div className="mt-14">
        <CheckoutForm dictionary={dictionary} locale={locale} />
      </div>
    </Section>
  );
}
