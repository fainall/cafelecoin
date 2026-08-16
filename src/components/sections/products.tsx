import Link from "next/link";

import { formatsByLine, formatWeight, lotPath } from "@/content/helpers";
import type { Format, Lot } from "@/content/schema";
import type { Dictionary } from "@/i18n";
import { translate, type Locale } from "@/i18n/config";
import { FloatingBeans } from "@/components/ui/beans";
import { LinkButton } from "@/components/ui/button";
import { ProductShot } from "@/components/ui/product-shot";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";

interface ProductsProps {
  formats: Format[];
  lots: Lot[];
  dictionary: Dictionary;
  locale: Locale;
}

/** Portafolio: la bolsa suspendida entre granos y las dos líneas comerciales. */
export function Products({ formats, lots, dictionary, locale }: ProductsProps) {
  const retail = formatsByLine(formats, "retail");
  const horeca = formatsByLine(formats, "horeca");
  const featured = lots[0];
  // Protagoniza la sección el formato mayor de HoReCa; si no hay, el primero.
  const showcase = horeca.at(-1) ?? formats[0];

  const groups = [
    { title: dictionary.portfolio.retail, note: dictionary.portfolio.retailNote, items: retail },
    { title: dictionary.portfolio.horeca, note: dictionary.portfolio.horecaNote, items: horeca },
  ];

  return (
    <>
      <Section id="portafolio" tone="dark" className="pt-6 sm:pt-10 lg:pt-12">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <p className="eyebrow text-gold-light">{dictionary.sections.portfolio.eyebrow}</p>
              <h2 className="display-xl text-cream mt-5 text-[clamp(2rem,4.6vw,3.6rem)]">
                {dictionary.sections.portfolio.title}
              </h2>
            </Reveal>

            <div className="mt-12 space-y-10">
              {groups.map((group, groupIndex) => (
                <Reveal key={group.title} delay={groupIndex * 120}>
                  <h3 className="font-display text-cream text-xl tracking-[0.08em]">
                    {group.title}
                  </h3>
                  <p className="text-cream-faint mt-1 text-base italic">— {group.note}</p>

                  <ul className="mt-5">
                    {group.items.map((format) => (
                      <li
                        key={format.id}
                        className="border-forest-line flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b py-4"
                      >
                        <span className="font-display text-gold-light w-24 shrink-0 text-lg tracking-[0.08em]">
                          {formatWeight(format.grams, locale)}
                        </span>
                        <span className="text-cream-dim flex-1 text-base leading-relaxed">
                          {translate(format.description, locale)}
                        </span>
                        {format.valve && (
                          <span className="label text-gold w-full sm:w-auto">
                            {dictionary.portfolio.valve}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>

            {featured && (
              <Reveal delay={260} className="mt-12">
                <LinkButton href={lotPath(locale, featured)}>
                  {dictionary.portfolio.viewLot}
                </LinkButton>
              </Reveal>
            )}
          </div>

          <div className="relative flex min-h-[440px] items-center justify-center lg:min-h-[600px]">
            <FloatingBeans />
            {showcase && (
              <Reveal delay={160} className="relative flex w-full items-center justify-center">
                <span
                  className="absolute bottom-4 left-1/2 h-12 w-[52%] -translate-x-1/2 rounded-[50%] bg-black/60 blur-2xl"
                  aria-hidden="true"
                />
                <ProductShot
                  src={showcase.image?.src ?? ""}
                  alt={
                    showcase.image
                      ? translate(showcase.image.alt, locale)
                      : `Le Coin ${formatWeight(showcase.grams, locale)}`
                  }
                  caption={formatWeight(showcase.grams, locale)}
                  sizes="(max-width: 1024px) 80vw, 480px"
                  className="relative h-[52svh] max-h-[560px] min-h-[380px] w-full"
                />
              </Reveal>
            )}
          </div>
        </div>

        {lots.length > 1 && (
          <ul className="border-forest-line mt-24 grid gap-px border sm:grid-cols-2">
            {lots.map((lot, index) => (
              <Reveal key={lot.slug} as="li" delay={index * 90} className="bg-forest">
                <Link
                  href={lotPath(locale, lot)}
                  className="hover:bg-forest-soft group flex h-full flex-col gap-3 p-8 text-center transition-colors duration-500"
                >
                  <span className="label text-gold-light">
                    {translate(lot.processLabel, locale)} · {lot.altitudeMasl} msnm
                  </span>
                  <h3 className="font-display text-cream text-xl tracking-[0.08em]">{lot.name}</h3>
                  <p className="text-cream-dim mx-auto max-w-[42ch] text-base">
                    {translate(lot.summary, locale)}
                  </p>
                  <span className="label text-cream-faint group-hover:text-gold-light mt-auto pt-4 transition-colors">
                    {dictionary.portfolio.viewLot}
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
