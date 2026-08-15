import Link from "next/link";

import { formatWeight, lotPath } from "@/content/helpers";
import type { Format, Lot } from "@/content/schema";
import type { Dictionary } from "@/i18n";
import { translate, type Locale } from "@/i18n/config";
import { LinkButton } from "@/components/ui/button";
import { ProductShot } from "@/components/ui/product-shot";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHead } from "@/components/ui/section";

interface ProductsProps {
  formats: Format[];
  lots: Lot[];
  dictionary: Dictionary;
  locale: Locale;
}

/** Portafolio: una ficha por formato, con la fotografía real del empaque. */
export function Products({ formats, lots, dictionary, locale }: ProductsProps) {
  const featured = lots[0];
  const ordered = [...formats].sort((a, b) => a.grams - b.grams);

  return (
    <Section id="portafolio" tone="dark">
      <SectionHead
        index="02"
        label={dictionary.sections.portfolio.eyebrow}
        title={dictionary.sections.portfolio.title}
        lede={dictionary.portfolio.valveNote}
      />

      <div className="mt-16 grid gap-px lg:mt-24 lg:grid-cols-2">
        {ordered.map((format, index) => (
          <Reveal
            key={format.id}
            delay={index * 110}
            className="border-ink-line bg-ink-raised flex flex-col border p-8 sm:p-12"
          >
            <div className="flex items-baseline justify-between gap-6">
              <p className="display text-bone text-5xl">{formatWeight(format.grams, locale)}</p>
              <p className="meta text-bone-muted">
                {format.line === "retail"
                  ? dictionary.portfolio.retail
                  : dictionary.portfolio.horeca}
              </p>
            </div>

            <div className="relative mt-10 h-[38svh] min-h-[280px]">
              <ProductShot
                src={format.image?.src ?? ""}
                alt={
                  format.image
                    ? translate(format.image.alt, locale)
                    : `Le Coin ${formatWeight(format.grams, locale)}`
                }
                caption={formatWeight(format.grams, locale)}
                sizes="(max-width: 1024px) 80vw, 40vw"
                className="h-full w-full"
              />
            </div>

            <p className="text-bone-muted mt-10 max-w-[44ch] text-[0.98rem] leading-relaxed">
              {translate(format.description, locale)}
            </p>

            <dl className="border-ink-line mt-8 border-t pt-5">
              {format.valve && (
                <div className="flex justify-between gap-6 py-1.5">
                  <dt className="meta text-bone-muted">{dictionary.portfolio.valve}</dt>
                  <dd className="meta text-cherry-bright">✓</dd>
                </div>
              )}
              {format.tags.map((tag) => (
                <div key={translate(tag, locale)} className="flex justify-between gap-6 py-1.5">
                  <dt className="meta text-bone-muted">{translate(tag, locale)}</dt>
                  <dd />
                </div>
              ))}
            </dl>
          </Reveal>
        ))}
      </div>

      {featured && (
        <Reveal delay={120} className="mt-14">
          <LinkButton href={lotPath(locale, featured)} variant="onDark">
            {dictionary.portfolio.viewLot}
          </LinkButton>
        </Reveal>
      )}

      {lots.length > 1 && (
        <ul className="border-ink-line mt-16 grid gap-px border-t sm:grid-cols-2">
          {lots.map((lot, index) => (
            <Reveal key={lot.slug} as="li" delay={index * 90}>
              <Link
                href={lotPath(locale, lot)}
                className="group border-ink-line flex h-full flex-col border-b py-8 sm:pr-10"
              >
                <span className="meta text-bone-muted">
                  {translate(lot.processLabel, locale)} · {lot.altitudeMasl} msnm
                </span>
                <h3 className="font-display text-bone group-hover:text-cherry-bright mt-3 text-2xl transition-colors">
                  {lot.name}
                </h3>
                <p className="text-bone-muted mt-2 max-w-[44ch] text-[0.98rem]">
                  {translate(lot.summary, locale)}
                </p>
              </Link>
            </Reveal>
          ))}
        </ul>
      )}
    </Section>
  );
}
