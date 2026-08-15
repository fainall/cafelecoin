import type { Dictionary } from "@/i18n";
import { LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

interface BandProps {
  dictionary: Dictionary;
}

/** Un solo enunciado a página completa: el punto de reposo del recorrido. */
export function Band({ dictionary }: BandProps) {
  return (
    <section className="bg-cherry py-24 sm:py-32">
      <div className="mx-auto w-full max-w-[100rem] px-6 sm:px-10 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Reveal>
              <p className="display text-paper text-[clamp(2rem,4.4vw,3.6rem)]">
                {dictionary.band.title}
              </p>
            </Reveal>
            <Reveal delay={90}>
              <p className="prose-editorial text-paper/80 mt-6">{dictionary.band.subtitle}</p>
            </Reveal>
          </div>

          <Reveal delay={160} className="flex items-end lg:col-span-4 lg:justify-end">
            <LinkButton href="#contacto" variant="onCherry">
              {dictionary.band.cta}
            </LinkButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
