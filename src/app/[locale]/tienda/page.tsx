import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCart } from "@/components/cart/add-to-cart";
import { ProductShot } from "@/components/ui/product-shot";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { content } from "@/content";
import { formatWeight } from "@/content/helpers";
import type { Format, ProductLineInfo } from "@/content/schema";
import { getDictionary } from "@/i18n";
import type { Dictionary } from "@/i18n";
import { isLocale, locales, localeTags, translate, type Locale } from "@/i18n/config";
import { formatMoney } from "@/lib/cart/money";
import { quoteHref } from "@/lib/cart/quote";

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
  const [formats, lines] = await Promise.all([content.getFormats(), content.getProductLines()]);

  return (
    <>
      <Section tone="dark" className="pt-36 pb-16 sm:pt-40">
        <SectionHeading eyebrow={dictionary.shop.eyebrow} title={dictionary.shop.title} />
        <Reveal className="prose mx-auto mt-10 text-center">
          <p className="text-cream-dim leading-relaxed">{dictionary.shop.intro}</p>
        </Reveal>
      </Section>

      {lines.map((line) => (
        <LineBlock
          key={line.id}
          line={line}
          formats={formats.filter((format) => format.line === line.id && format.retailPrice)}
          dictionary={dictionary}
          locale={locale}
        />
      ))}

      <Section tone="dark" className="py-14">
        <Reveal className="text-center">
          <Link
            href={`/${locale}`}
            className="label text-cream-faint hover:text-gold-light transition-colors"
          >
            ← {dictionary.shop.backHome}
          </Link>
        </Reveal>
      </Section>
    </>
  );
}

/**
 * Un bloque por línea comercial, sobre superficies opuestas: la de hogar sobre
 * papel, como su bolsa botánica; la de barra sobre negro, como la suya. La
 * diferencia entre ambas se ve antes de leer una palabra.
 */
function LineBlock({
  line,
  formats,
  dictionary,
  locale,
}: {
  line: ProductLineInfo;
  formats: Format[];
  dictionary: Dictionary;
  locale: Locale;
}) {
  const claro = line.id === "retail";

  const t = claro
    ? {
        surface: "bg-paper",
        title: "text-ink",
        body: "text-ink-soft",
        accent: "text-gold-deep",
        line: "border-paper-line",
        card: "bg-paper-soft",
      }
    : {
        surface: "bg-forest-deep",
        title: "text-cream",
        body: "text-cream-dim",
        accent: "text-gold-light",
        line: "border-forest-line",
        card: "bg-forest-soft",
      };

  return (
    <section className={`${t.surface} py-20 sm:py-24`}>
      <div className="mx-auto w-full max-w-[82rem] px-6 sm:px-10 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <p className={`label ${t.accent}`}>{translate(line.audience, locale)}</p>
            <h2 className={`display-xl mt-4 text-[clamp(1.6rem,3.4vw,2.6rem)] ${t.title}`}>
              {line.name}
            </h2>
            <p className={`mt-3 text-lg italic ${t.body}`}>{translate(line.tagline, locale)}</p>
            <p className={`mt-6 leading-relaxed ${t.body}`}>
              {translate(line.description, locale)}
            </p>

            <ul className={`mt-8 border-t ${t.line}`}>
              {line.traits.map((trait) => (
                <li key={translate(trait, locale)} className={`border-b py-3 ${t.line}`}>
                  <span className={`label ${t.body}`}>{translate(trait, locale)}</span>
                </li>
              ))}
            </ul>

            {/* Esta línea no se cierra por carrito sino por propuesta: el
                enlace lleva sus formatos ya marcados en el formulario. */}
            {line.requestQuote && (
              <div className="mt-8">
                <Link
                  href={quoteHref(
                    locale,
                    formats.map((format) => format.id),
                  )}
                  className={`font-display inline-block border px-8 py-3.5 text-[0.72rem] tracking-[0.22em] uppercase transition-colors ${
                    claro
                      ? "border-ink/25 text-ink hover:bg-ink hover:text-paper"
                      : "border-gold/50 text-gold-light hover:bg-gold hover:text-forest-deep"
                  }`}
                >
                  {dictionary.shop.quoteCta}
                </Link>
                <p className={`mt-3 max-w-[38ch] text-sm ${t.body}`}>{dictionary.shop.quoteNote}</p>
              </div>
            )}
          </Reveal>

          <div className="grid gap-8 lg:col-span-8 lg:grid-cols-2">
            {formats.map((format, index) => (
              <Reveal
                key={format.id}
                delay={index * 90}
                className={`flex flex-col border p-8 ${t.line} ${t.card}`}
              >
                <div className="relative mx-auto h-56 w-full">
                  <ProductShot
                    src={format.image?.src ?? ""}
                    alt={
                      format.image
                        ? translate(format.image.alt, locale)
                        : `Le Coin ${formatWeight(format.grams, locale)}`
                    }
                    caption={formatWeight(format.grams, locale)}
                    tone={claro ? "paper" : "dark"}
                    sizes="(max-width: 1024px) 70vw, 320px"
                    className="h-full w-full"
                  />
                </div>

                <div className="mt-7 flex items-baseline justify-between gap-4">
                  <p className={`display-xl text-2xl ${t.title}`}>
                    {formatWeight(format.grams, locale)}
                  </p>
                  <p className={`font-display text-2xl tracking-[0.06em] ${t.accent}`}>
                    {formatMoney(format.retailPrice!, locale)}
                  </p>
                </div>

                <p className={`mt-3 text-base leading-relaxed ${t.body}`}>
                  {translate(format.description, locale)}
                </p>

                {format.wholesaleTiers.length > 0 && (
                  <dl className={`mt-6 border-t pt-4 ${t.line}`}>
                    <dt className={`label ${t.body}`}>{dictionary.shop.wholesaleTitle}</dt>
                    {format.wholesaleTiers.map((tier) => (
                      <dd
                        key={tier.minQuantity}
                        className={`mt-1.5 flex justify-between text-sm ${t.body}`}
                      >
                        <span>
                          {dictionary.cart.from} {tier.minQuantity} {dictionary.cart.units}
                        </span>
                        <span className={t.title}>
                          {formatMoney(tier.unit, locale)} {dictionary.cart.each}
                        </span>
                      </dd>
                    ))}
                  </dl>
                )}

                <div className="mt-auto pt-8">
                  <AddToCart
                    formatId={format.id}
                    dictionary={dictionary}
                    tone={claro ? "paper" : "dark"}
                    disabled={format.stock === "agotado"}
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
