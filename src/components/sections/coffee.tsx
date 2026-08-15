import type { Estate, Highlight } from "@/content/schema";
import { translate, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHead } from "@/components/ui/section";

interface CoffeeProps {
  estate: Estate;
  highlights: Highlight[];
  dictionary: Dictionary;
  locale: Locale;
}

/** El relato de marca y los pilares del origen, sobre papel. */
export function Coffee({ estate, highlights, dictionary, locale }: CoffeeProps) {
  const [lede, ...paragraphs] = translate(estate.story, locale);

  return (
    <Section id="historia" tone="light">
      <SectionHead
        index="01"
        label={dictionary.sections.story.eyebrow}
        title={dictionary.sections.story.title}
        tone="light"
      />

      <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-3" />
        <div className="lg:col-span-5">
          <Reveal>
            <p className="prose-editorial text-graphite text-[1.35rem] leading-[1.5]">{lede}</p>
          </Reveal>
        </div>
        <div className="lg:col-span-4">
          {paragraphs.map((paragraph, index) => (
            <Reveal key={index} delay={index * 80}>
              <p className="text-graphite-muted mt-6 max-w-[46ch] text-[0.98rem] leading-relaxed first:mt-0">
                {paragraph}
              </p>
            </Reveal>
          ))}
          <Reveal delay={200}>
            <p className="font-display text-graphite border-paper-line mt-8 border-l pl-5 text-lg italic">
              {translate(estate.claim, locale)}
            </p>
          </Reveal>
        </div>
      </div>

      <Reveal delay={80} className="mt-20 lg:mt-28">
        <figure>
          <Photo
            src="/img/ambiente-taza.jpg"
            alt={
              locale === "en"
                ? "Le Coin 250 g bag next to a freshly served cup of coffee"
                : "Bolsa de 250 g de Le Coin junto a una taza de café recién servida"
            }
            className="aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[21/9]"
            sizes="(max-width: 1024px) 100vw, 100rem"
            focus="center 20%"
            fallback={<div className="bg-paper-raised h-full w-full" />}
          />
          <figcaption className="border-paper-line text-graphite-muted meta mt-4 border-t pt-4">
            {locale === "en"
              ? "Retail format · 250 g · 100% arabica"
              : "Formato retail · 250 g · 100% café arábico"}
          </figcaption>
        </figure>
      </Reveal>

      <ol className="border-paper-line mt-20 grid gap-px border-t sm:grid-cols-3 lg:mt-28">
        {highlights.map((highlight, index) => (
          <Reveal
            key={highlight.id}
            as="li"
            delay={index * 90}
            className="border-paper-line border-b py-8 sm:border-b-0 sm:pr-10"
          >
            <span className="index text-cherry">{String(index + 1).padStart(2, "0")}</span>
            <h3 className="font-display text-graphite mt-4 text-2xl">
              {translate(highlight.title, locale)}
            </h3>
            <p className="text-graphite-muted mt-3 max-w-[38ch] text-[0.98rem] leading-relaxed">
              {translate(highlight.body, locale)}
            </p>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
