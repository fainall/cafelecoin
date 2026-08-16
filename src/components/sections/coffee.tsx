import type { Estate, Highlight } from "@/content/schema";
import { translate, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { LinkButton } from "@/components/ui/button";
import { TornEdge } from "@/components/ui/divider";
import { featureIcons } from "@/components/ui/feature-icons";
import { LandscapeBackdrop } from "@/components/ui/landscape-backdrop";
import { Reveal } from "@/components/ui/reveal";
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
      <Section
        id="historia"
        tone="paper"
        className="pt-16 sm:pt-20 lg:pt-24"
        // Los cerros se mueven detrás del relato; el velo de papel mantiene el
        // contraste del texto.
        backdrop={
          <LandscapeBackdrop veil="linear-gradient(to bottom, rgba(244,241,233,0.94) 0%, rgba(244,241,233,0.78) 34%, rgba(244,241,233,0.7) 62%, rgba(244,241,233,0.9) 100%)" />
        }
      >
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

        <ul className="mx-auto mt-24 grid max-w-5xl gap-14 sm:grid-cols-3 lg:mt-28">
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
