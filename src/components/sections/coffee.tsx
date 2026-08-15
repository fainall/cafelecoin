import type { Estate, Highlight } from "@/content/schema";
import { translate, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { LinkButton } from "@/components/ui/button";
import { TornEdge } from "@/components/ui/divider";
import { featureIcons } from "@/components/ui/feature-icons";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/reveal";
import { LeafScene } from "@/components/ui/scenes";
import { Section, SectionHeading } from "@/components/ui/section";

interface CoffeeProps {
  estate: Estate;
  highlights: Highlight[];
  dictionary: Dictionary;
  locale: Locale;
}

/** Relato de marca sobre papel, centrado, con los tres pilares del origen. */
export function Coffee({ estate, highlights, dictionary, locale }: CoffeeProps) {
  const paragraphs = translate(estate.story, locale);

  return (
    <>
      <TornEdge fill="fill-paper" behind="bg-forest" />
      <Section id="historia" tone="paper" className="pt-16 sm:pt-20 lg:pt-24">
        <SectionHeading
          eyebrow={dictionary.sections.story.eyebrow}
          title={dictionary.sections.story.title}
          tone="paper"
        />

        <div className="prose mx-auto mt-12 text-center">
          {paragraphs.map((paragraph, index) => (
            <Reveal key={index} delay={index * 90}>
              <p className="text-ink-soft mt-5 leading-relaxed first:mt-0">{paragraph}</p>
            </Reveal>
          ))}

          <Reveal delay={280}>
            <p className="font-display text-ink mt-9 text-sm tracking-[0.14em] uppercase">
              {translate(estate.claim, locale)}
            </p>
          </Reveal>

          <Reveal delay={360} className="mt-10">
            <LinkButton href="#origen" variant="outlineDark">
              {dictionary.common.learnMore}
            </LinkButton>
          </Reveal>
        </div>

        <Reveal delay={80} className="mt-20 lg:mt-24">
          <figure>
            <Photo
              src="/img/ambiente-taza.jpg"
              alt={
                locale === "en"
                  ? "Le Coin 250 g bag next to a freshly served cup of coffee"
                  : "Bolsa de 250 g de Le Coin junto a una taza de café recién servida"
              }
              className="aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[2/1]"
              sizes="(max-width: 1024px) 100vw, 82rem"
              focus="center 12%"
              fallback={<LeafScene />}
            />
            <figcaption className="label text-ink-soft mt-4 text-center">
              {locale === "en"
                ? "Retail format · 250 g · 100% arabica coffee"
                : "Formato retail · 250 g · 100% café arábico"}
            </figcaption>
          </figure>
        </Reveal>

        <ul className="mx-auto mt-20 grid max-w-5xl gap-14 sm:grid-cols-3 lg:mt-24">
          {highlights.map((highlight, index) => {
            const Icon = featureIcons[highlight.icon];
            return (
              <Reveal key={highlight.id} as="li" delay={index * 110} className="text-center">
                <Icon className="text-gold-deep mx-auto h-16 w-16" />
                <h3 className="font-display text-ink mt-6 text-sm tracking-[0.2em] uppercase">
                  {translate(highlight.title, locale)}
                </h3>
                <p className="text-ink-soft mx-auto mt-3 max-w-[34ch] text-base leading-relaxed">
                  {translate(highlight.body, locale)}
                </p>
              </Reveal>
            );
          })}
        </ul>
      </Section>
    </>
  );
}
