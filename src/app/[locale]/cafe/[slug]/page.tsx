import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Contact } from "@/components/sections/contact";
import { FloatingBeans } from "@/components/ui/beans";
import { TornEdge } from "@/components/ui/divider";
import { Meter } from "@/components/ui/meter";
import { ProductShot } from "@/components/ui/product-shot";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { TechnicalSheet } from "@/components/ui/technical-sheet";
import { content } from "@/content";
import { formatWeight, translateOrNull } from "@/content/helpers";
import { getDictionary } from "@/i18n";
import { isLocale, locales, localeTags, translate, type Locale } from "@/i18n/config";
import { lotJsonLd } from "@/lib/seo";

export const dynamicParams = false;

export async function generateStaticParams() {
  const lots = await content.getLots();
  return locales.flatMap((locale) => lots.map((lot) => ({ locale, slug: lot.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};

  const locale: Locale = raw;
  const lot = await content.getLot(slug);
  if (!lot) return {};

  const estate = await content.getEstate();
  const dictionary = getDictionary(locale);
  const description = `${dictionary.meta.lotDescriptionPrefix} ${lot.name}. ${translate(lot.summary, locale)}`;

  return {
    // El nombre del lote ya incluye la marca: se evita "Le Coin · X · Le Coin".
    title: { absolute: `${lot.name} — ${estate.city}, ${estate.country}` },
    description,
    alternates: {
      canonical: `/${locale}/cafe/${lot.slug}`,
      languages: Object.fromEntries(
        locales.map((code) => [localeTags[code], `/${code}/cafe/${lot.slug}`]),
      ),
    },
    openGraph: {
      type: "article",
      title: lot.name,
      description,
      url: `/${locale}/cafe/${lot.slug}`,
    },
  };
}

export default async function LotPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;

  const lot = await content.getLot(slug);
  if (!lot) notFound();

  const dictionary = getDictionary(locale);
  const [estate, contactInfo, formats] = await Promise.all([
    content.getEstate(),
    content.getContact(),
    content.getFormatsByIds(lot.formatIds),
  ]);

  return (
    <>
      <Section tone="dark" className="pt-36 sm:pt-40">
        <Reveal className="text-center">
          <Link
            href={`/${locale}#portafolio`}
            className="label text-cream-faint hover:text-gold-light transition-colors"
          >
            ← {dictionary.lot.backToPortfolio}
          </Link>
        </Reveal>

        <Reveal delay={80} className="mt-10 text-center">
          <p className="eyebrow text-gold-light">
            {dictionary.lot.status[lot.status]} · {translate(lot.processLabel, locale)}
          </p>
          <h1 className="display-xl text-cream mt-5 text-[clamp(1.9rem,4.4vw,3.4rem)]">
            {lot.name}
          </h1>
          <p className="text-cream-dim prose mx-auto mt-6 leading-relaxed">
            {translate(lot.summary, locale)}
          </p>
          <p className="label text-cream-faint mt-6">
            {dictionary.lot.harvestWindow} · {translate(lot.harvestWindow, locale)}
          </p>
        </Reveal>

        <div className="relative mx-auto mt-16 flex h-[52svh] max-w-3xl items-end justify-center">
          <FloatingBeans className="hidden sm:block" />
          {formats[0] && (
            <Reveal delay={160} className="relative flex h-full w-full items-end justify-center">
              <span
                className="absolute bottom-2 left-1/2 h-10 w-[42%] -translate-x-1/2 rounded-[50%] bg-black/55 blur-2xl"
                aria-hidden="true"
              />
              <ProductShot
                src={formats[0].image?.src ?? ""}
                alt={formats[0].image ? translate(formats[0].image.alt, locale) : lot.name}
                caption={formatWeight(formats[0].grams, locale)}
                priority
                sizes="(max-width: 640px) 62vw, 340px"
                className="relative h-full w-[min(62vw,300px)]"
              />
            </Reveal>
          )}
        </div>
      </Section>

      <TornEdge fill="fill-paper" behind="bg-forest" />
      <Section tone="paper" className="pt-16 sm:pt-20">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <h2 className="label text-gold-deep mb-6 text-center lg:text-left">
                {dictionary.lot.technicalSheet}
              </h2>
            </Reveal>
            <TechnicalSheet
              lot={lot}
              estate={estate}
              dictionary={dictionary}
              locale={locale}
              tone="paper"
            />
          </div>

          <div>
            <Reveal>
              <h2 className="label text-gold-deep mb-6 text-center lg:text-left">
                {dictionary.lot.cupping}
              </h2>
            </Reveal>

            <Reveal delay={60}>
              <ul className="flex flex-wrap justify-center gap-2 lg:justify-start">
                {lot.sensory.notes.map((note) => (
                  <li
                    key={translate(note, locale)}
                    className="border-paper-line text-ink-soft label border px-4 py-2"
                  >
                    {translate(note, locale)}
                  </li>
                ))}
              </ul>
            </Reveal>

            <div className="mt-10">
              {lot.sensory.attributes.map((attribute, index) => (
                <Meter
                  key={attribute.id}
                  tone="paper"
                  label={translate(attribute.label, locale)}
                  value={attribute.value}
                  display={translateOrNull(attribute.display, locale)}
                  delay={index * 60}
                />
              ))}
            </div>

            {lot.sensory.scaScore !== undefined && (
              <Reveal delay={200} className="mt-10 flex items-baseline gap-4">
                <span className="font-display text-ink text-5xl leading-none">
                  {lot.sensory.scaScore}
                </span>
                <span className="label text-gold-deep">{dictionary.profile.scoreUnit}</span>
              </Reveal>
            )}
          </div>
        </div>

        <div className="mt-24">
          <Reveal>
            <h2 className="label text-gold-deep text-center">{dictionary.lot.availableFormats}</h2>
          </Reveal>

          <div className="mt-12 grid gap-12 sm:grid-cols-2">
            {formats.map((format, index) => (
              <Reveal key={format.id} delay={index * 90} className="text-center">
                <div className="relative mx-auto flex h-64 w-full items-end justify-center">
                  <span
                    className="absolute bottom-1 left-1/2 h-6 w-[34%] -translate-x-1/2 rounded-[50%] bg-black/20 blur-xl"
                    aria-hidden="true"
                  />
                  <ProductShot
                    src={format.image?.src ?? ""}
                    alt={
                      format.image
                        ? translate(format.image.alt, locale)
                        : `Le Coin ${formatWeight(format.grams, locale)}`
                    }
                    caption={formatWeight(format.grams, locale)}
                    tone="paper"
                    sizes="(max-width: 640px) 55vw, 260px"
                    className="relative h-full w-44"
                  />
                </div>
                <p className="font-display text-ink mt-6 text-2xl tracking-[0.06em]">
                  {formatWeight(format.grams, locale)}
                </p>
                <p className="text-ink-soft mx-auto mt-2 max-w-[38ch] text-base leading-relaxed">
                  {translate(format.description, locale)}
                </p>
                {format.valve && (
                  <p className="label text-gold-deep mt-3">{dictionary.portfolio.valve}</p>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Contact
        contact={contactInfo}
        estate={estate}
        formats={formats}
        dictionary={dictionary}
        locale={locale}
        lotSlug={lot.slug}
        lotName={lot.name}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(lotJsonLd(lot, estate, contactInfo, locale)),
        }}
      />
    </>
  );
}
