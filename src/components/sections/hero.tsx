import type { Estate, Format } from "@/content/schema";
import { formatWeight } from "@/content/helpers";
import { translate, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { LinkButton } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/reveal";

interface HeroProps {
  estate: Estate;
  /** Formato que protagoniza la portada (el retail de 250 g). */
  hero: Format;
  dictionary: Dictionary;
  locale: Locale;
}

/**
 * Portada partida: la palabra a la izquierda sobre negro de tueste, la
 * fotografía a sangre a la derecha. Sin ornamento, la foto hace el trabajo.
 */
export function Hero({ estate, hero, dictionary, locale }: HeroProps) {
  const facts = [
    { es: "100% Arábica", en: "100% Arabica" },
    { es: "Finca propia", en: "Single estate" },
    { es: "Recolección a mano", en: "Hand-picked" },
  ].map((item) => translate(item, locale));

  return (
    <section className="bg-ink relative grid min-h-[92svh] items-stretch lg:grid-cols-12">
      <div className="flex flex-col justify-center px-6 pt-32 pb-16 sm:px-10 lg:col-span-6 lg:px-16 lg:pt-40 lg:pb-24">
        <Reveal>
          <p className="meta text-cherry-bright">{dictionary.hero.eyebrow}</p>
        </Reveal>

        <Reveal delay={90}>
          <h1 className="display text-bone mt-8 text-[clamp(2.9rem,6.4vw,5.6rem)]">
            {translate(estate.tagline, locale)}
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="prose-editorial text-bone-muted mt-8">
            {translate(estate.subTagline, locale)}
          </p>
        </Reveal>

        <Reveal delay={230} className="mt-12 flex flex-wrap gap-3">
          <LinkButton href="#portafolio">{dictionary.hero.primaryCta}</LinkButton>
          <LinkButton href="#contacto" variant="onDark">
            {dictionary.hero.secondaryCta}
          </LinkButton>
        </Reveal>

        <Reveal delay={300} className="border-ink-line mt-16 border-t pt-6">
          <ul className="flex flex-wrap gap-x-10 gap-y-3">
            {facts.map((fact) => (
              <li key={fact} className="meta text-bone-muted">
                {fact}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <div className="relative min-h-[60svh] lg:col-span-6 lg:min-h-full">
        <Photo
          src="/img/ambiente-cocina.jpg"
          alt={
            locale === "en"
              ? `Le Coin ${formatWeight(hero.grams, locale)} bag on a kitchen counter with roasted beans`
              : `Bolsa de ${formatWeight(hero.grams, locale)} de Le Coin sobre la barra, junto a granos tostados`
          }
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          focus="center 42%"
          className="h-full w-full"
          fallback={<div className="bg-ink-raised h-full w-full" />}
        />
        <div
          className="from-ink/70 pointer-events-none absolute inset-0 bg-gradient-to-r to-transparent lg:from-ink lg:via-ink/10"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
