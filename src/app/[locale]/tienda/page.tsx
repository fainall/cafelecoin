import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCart } from "@/components/cart/add-to-cart";
import { ProductShot } from "@/components/ui/product-shot";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { content } from "@/content";
import { formatWeight } from "@/content/helpers";
import { getDictionary } from "@/i18n";
import { isLocale, locales, localeTags, translate, type Locale } from "@/i18n/config";
import { formatMoney } from "@/lib/cart/money";

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
    title: dictionary.shop.title,
    description: dictionary.shop.intro,
    alternates: {
      canonical: `/${locale}/tienda`,
      languages: Object.fromEntries(locales.map((code) => [localeTags[code], `/${code}/tienda`])),
    },
  };
}

export default async function ShopPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;

  const dictionary = getDictionary(locale);
  const formats = await content.getFormats();
  // Solo se ofrece en línea lo que tiene precio de lista.
  const alaVenta = formats.filter((format) => format.retailPrice);

  return (
    <Section tone="dark" className="pt-36 sm:pt-40">
      <SectionHeading eyebrow={dictionary.shop.eyebrow} title={dictionary.shop.title} />

      <Reveal className="prose mx-auto mt-10 text-center">
        <p className="text-cream-dim leading-relaxed">{dictionary.shop.intro}</p>
      </Reveal>

      <div className="mx-auto mt-16 grid max-w-5xl gap-px lg:mt-20 lg:grid-cols-2">
        {alaVenta.map((format, index) => (
          <Reveal
            key={format.id}
            delay={index * 90}
            className="border-forest-line bg-forest-soft flex flex-col border p-8 sm:p-10"
          >
            <div className="relative mx-auto h-64 w-full">
              <ProductShot
                src={format.image?.src ?? ""}
                alt={
                  format.image
                    ? translate(format.image.alt, locale)
                    : `Le Coin ${formatWeight(format.grams, locale)}`
                }
                caption={formatWeight(format.grams, locale)}
                sizes="(max-width: 1024px) 70vw, 380px"
                className="h-full w-full"
              />
            </div>

            <div className="mt-8 flex items-baseline justify-between gap-4">
              <p className="display-xl text-cream text-2xl">{formatWeight(format.grams, locale)}</p>
              <p className="font-display text-gold-light text-2xl tracking-[0.06em]">
                {formatMoney(format.retailPrice!, locale)}
              </p>
            </div>

            <p className="text-cream-dim mt-3 text-base leading-relaxed">
              {translate(format.description, locale)}
            </p>

            {format.wholesaleTiers.length > 0 && (
              <dl className="border-forest-line mt-6 border-t pt-4">
                <dt className="label text-cream-faint">{dictionary.shop.wholesaleTitle}</dt>
                {format.wholesaleTiers.map((tier) => (
                  <dd
                    key={tier.minQuantity}
                    className="text-cream-dim mt-1.5 flex justify-between text-sm"
                  >
                    <span>
                      {dictionary.cart.from} {tier.minQuantity} {dictionary.cart.units}
                    </span>
                    <span className="text-cream">
                      {formatMoney(tier.unit, locale)} {dictionary.cart.each}
                    </span>
                  </dd>
                ))}
              </dl>
            )}

            <div className="mt-8">
              <AddToCart
                formatId={format.id}
                dictionary={dictionary}
                disabled={format.stock === "agotado"}
              />
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-16 text-center">
        <Link
          href={`/${locale}`}
          className="label text-cream-faint hover:text-gold-light transition-colors"
        >
          ← {dictionary.shop.backHome}
        </Link>
      </Reveal>
    </Section>
  );
}
