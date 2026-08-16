import { formatAltitude } from "@/content/helpers";
import type { Estate, Lot } from "@/content/schema";
import type { Dictionary } from "@/i18n";
import { translate, type Locale } from "@/i18n/config";
import { ParallaxFrame } from "@/components/ui/parallax";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/reveal";
import { MountainScene } from "@/components/ui/scenes";

interface OriginBandProps {
  estate: Estate;
  lot: Lot;
  dictionary: Dictionary;
  locale: Locale;
}

/**
 * Banda de origen a sangre: los cerros del eje cafetero desplazándose dentro
 * del marco mientras la página avanza, con el nombre del origen encima.
 *
 * La ciudad y el departamento salen de la capa de contenido, así que corregir
 * el origen es editar src/content/data/estate.ts y nada más.
 */
export function OriginBand({ estate, lot, dictionary, locale }: OriginBandProps) {
  return (
    <section className="relative">
      <ParallaxFrame range={140} className="h-[58svh] max-h-[560px] min-h-[340px]">
        {estate.image ? (
          <Photo
            src={estate.image.src}
            alt={translate(estate.image.alt, locale)}
            focus={estate.image.focus}
            sizes="100vw"
            className="h-full w-full"
            fallback={<MountainScene />}
          />
        ) : (
          <MountainScene />
        )}
      </ParallaxFrame>

      {/* Velo: sostiene la lectura del texto sin apagar el verde */}
      <div
        className="from-forest-deep/85 via-forest-deep/45 to-forest absolute inset-0 bg-gradient-to-b"
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <Reveal>
          <p className="eyebrow text-gold-light">{dictionary.sections.origin.eyebrow}</p>
        </Reveal>

        <Reveal delay={90}>
          <p className="display-xl text-cream mt-4 text-[clamp(2rem,5.2vw,4rem)]">{estate.city}</p>
        </Reveal>

        <Reveal delay={170}>
          <p className="label text-cream-dim mt-4">
            {estate.department} · {estate.country} · {formatAltitude(lot.altitudeMasl, locale)}{" "}
            {dictionary.origin.masl}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
