import type { Dictionary } from "@/i18n";
import { LandscapeBackdrop } from "@/components/ui/landscape-backdrop";
import { SectionHeading } from "@/components/ui/section";

interface LandscapeBandProps {
  dictionary: Dictionary;
}

/**
 * Portada de la sección de proceso: el paisaje de origen a sangre, con el
 * título encima.
 *
 * El paisaje va en dos planos que se separan al desplazarse (ver
 * LandscapeBackdrop), así que el título queda quieto mientras el terreno se
 * mueve por detrás.
 */
export function LandscapeBand({ dictionary }: LandscapeBandProps) {
  return (
    <section className="bg-forest relative flex h-[72svh] max-h-[640px] min-h-[380px] items-center justify-center overflow-hidden">
      {/* El velo sostiene la lectura del título sobre la fotografía. */}
      <LandscapeBackdrop veil="linear-gradient(to bottom, rgba(15,19,13,0.62) 0%, rgba(15,19,13,0.5) 42%, rgba(15,19,13,0.34) 74%, rgba(15,19,13,0.5) 100%)" />

      <div className="relative z-10 w-full px-6 [text-shadow:0_2px_24px_rgba(0,0,0,0.5)]">
        <SectionHeading
          eyebrow={dictionary.sections.process.eyebrow}
          title={dictionary.sections.process.title}
        />
      </div>
    </section>
  );
}
