import type { Dictionary } from "@/i18n";
import { LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

interface BandProps {
  dictionary: Dictionary;
}

/** Banda dorada: un solo enunciado y la llamada a solicitar muestras. */
export function Band({ dictionary }: BandProps) {
  return (
    <section className="bg-gold relative overflow-hidden py-20 text-center sm:py-24">
      <div className="relative mx-auto max-w-3xl px-6">
        <Reveal>
          <h2 className="display-xl text-forest-deep text-[clamp(1.6rem,3.6vw,2.8rem)]">
            {dictionary.band.title}
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="text-forest-deep/85 mx-auto mt-5 max-w-xl text-lg">
            {dictionary.band.subtitle}
          </p>
        </Reveal>
        <Reveal delay={220} className="mt-9">
          <LinkButton href="#contacto" variant="onGold">
            {dictionary.band.cta}
          </LinkButton>
        </Reveal>
      </div>
    </section>
  );
}
