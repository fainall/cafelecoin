import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Contact } from "@/components/sections/contact";
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
      <Section tone="dark" className="pt-36 pb-0 sm:pt-40 lg:pt-44">
        <Reveal>
          <Link
            href={`/${locale}#portafolio`}
            className="meta text-bone-muted hover:text-bone transition-colors"
          >
            ← {dictionary.lot.backToPortfolio}
          </Link>
        </Reveal>

        <div className="mt-12 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal delay={80}>
              <p className="meta text-cherry-bright">
                {dictionary.lot.status[lot.status]} · {translate(lot.processLabel, locale)}
              </p>
              <h1 className="display text-bone mt-6 text-[clamp(2.6rem,6vw,5rem)]">{lot.name}</h1>
              <p className="prose-editorial text-bone-muted mt-8">
                {translate(lot.summary, locale)}
              </p>
              <p className="meta text-bone-muted mt-8">
                {dictionary.lot.harvestWindow} · {translate(lot.harvestWindow, locale)}
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            {formats[0] && (
              <Reveal delay={140} className="border-ink-line bg-ink-raised border p-10">
                <ProductShot
                  src={formats[0].image?.src ?? ""}
                  alt={formats[0].image ? translate(formats[0].image.alt, locale) : lot.name}
                  caption={formatWeight(formats[0].grams, locale)}
                  priority
                  sizes="(max-width: 1024px) 70vw, 30vw"
                  className="h-[42svh] min-h-[300px] w-full"
                />
              </Reveal>
            )}
          </div>
        </div>
      </Section>

      <Section tone="light">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-3">
            <Reveal>
              <p className="meta text-graphite-muted">{dictionary.lot.technicalSheet}</p>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <TechnicalSheet
              lot={lot}
              estate={estate}
              dictionary={dictionary}
              locale={locale}
              tone="light"
            />
          </div>

          <div className="lg:col-span-4">
            <Reveal>
              <p className="meta text-graphite-muted">{dictionary.lot.cupping}</p>
            </Reveal>

            <Reveal delay={60}>
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                {lot.sensory.notes.map((note) => (
                  <li key={translate(note, locale)} className="font-display text-graphite text-lg">
                    {translate(note, locale)}
                  </li>
                ))}
              </ul>
            </Reveal>

            <div className="mt-10">
              {lot.sensory.attributes.map((attribute, index) => (
                <Meter
                  key={attribute.id}
                  tone="light"
                  label={translate(attribute.label, locale)}
                  value={attribute.value}
                  display={translateOrNull(attribute.display, locale)}
                  delay={index * 50}
                />
              ))}
            </div>

            {lot.sensory.scaScore !== undefined && (
              <Reveal delay={160} className="mt-8 flex items-baseline gap-4">
                <span className="display text-graphite text-5xl tabular-nums">
                  {lot.sensory.scaScore}
                </span>
                <span className="meta text-graphite-muted">{dictionary.profile.scoreUnit}</span>
              </Reveal>
            )}
          </div>
        </div>

        <div className="mt-24">
          <Reveal>
            <p className="meta text-graphite-muted">{dictionary.lot.availableFormats}</p>
          </Reveal>

          <div className="border-paper-line mt-6 grid gap-px border-t sm:grid-cols-2">
            {formats.map((format, index) => (
              <Reveal
                key={format.id}
                delay={index * 80}
                className="border-paper-line flex items-center gap-8 border-b py-10 sm:pr-10"
              >
                <ProductShot
                  src={format.image?.src ?? ""}
                  alt={
                    format.image
                      ? translate(format.image.alt, locale)
                      : `Le Coin ${formatWeight(format.grams, locale)}`
                  }
                  caption={formatWeight(format.grams, locale)}
                  tone="light"
                  sizes="(max-width: 640px) 40vw, 200px"
                  className="h-48 w-32 shrink-0"
                />
                <div>
                  <p className="display text-graphite text-3xl">
                    {formatWeight(format.grams, locale)}
                  </p>
                  <p className="text-graphite-muted mt-3 max-w-[36ch] text-[0.95rem] leading-relaxed">
                    {translate(format.description, locale)}
                  </p>
                  {format.valve && (
                    <p className="meta text-cherry mt-4">{dictionary.portfolio.valve}</p>
                  )}
                </div>
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
