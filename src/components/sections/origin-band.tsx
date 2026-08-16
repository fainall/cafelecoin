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
 * Paisaje del origen en cuatro planos.
 *
 * Cada capa es una fotografía recortada contra el cielo
 * (scripts/separar-capas.mjs) y se desplaza a distinta velocidad y con distinta
 * deriva lateral: el cielo casi quieto, la ladera de cafetos adelantándose. El
 * resultado es que al bajar se recorre el paisaje en vez de mirarlo.
 *
 * Las capas se apilan de fondo a frente; si un archivo falta, la escena sigue
 * en pie con las demás.
 */
const planos = [
  // Fondo: se queda muy atrás.
  { src: "/img/cielo.webp", range: 150, drift: -20, z: "z-0" },
  { src: "/img/cerro-lejano.webp", range: 105, drift: -55, z: "z-10" },
  { src: "/img/cerro-medio.webp", range: 45, drift: -120, z: "z-20" },
  // Primer plano: se adelanta a la página.
  { src: "/img/cerro-cercano.webp", range: -70, drift: -210, z: "z-30" },
];

export function OriginBand({ estate, lot, dictionary, locale }: OriginBandProps) {
  const alt = estate.image ? translate(estate.image.alt, locale) : "";

  return (
    <section className="bg-forest relative h-[86svh] max-h-[760px] min-h-[420px] overflow-hidden">
      {/* El posicionamiento va en un envoltorio: ParallaxFrame ya se declara
          `relative`, y superponerle `absolute` lo deja sin altura. */}
      {planos.map((plano, index) => (
        <div key={plano.src} className={`absolute inset-0 ${plano.z}`}>
          <ParallaxFrame range={plano.range} drift={plano.drift} className="h-full w-full">
            <Photo
              src={plano.src}
              // Solo la primera capa describe la escena; el resto es decorativo.
              alt={index === 0 ? alt : ""}
              sizes="100vw"
              className="h-full w-full"
              fallback={index === 0 ? <MountainScene /> : <span />}
            />
          </ParallaxFrame>
        </div>
      ))}

      {/* Velo: oscurece arriba para que se lea el nombre y cierra abajo contra
          la sección siguiente, dejando limpio el centro, que es donde están
          los cafetos en fruto. */}
      <div
        className="absolute inset-0 z-40 bg-[linear-gradient(to_bottom,rgba(15,19,13,0.82)_0%,rgba(15,19,13,0.18)_38%,rgba(21,26,19,0.08)_68%,rgba(21,26,19,0.72)_100%)]"
        aria-hidden="true"
      />

      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center px-6 text-center">
        <Reveal>
          <p className="eyebrow text-gold-light">{dictionary.sections.origin.eyebrow}</p>
        </Reveal>

        <Reveal delay={90}>
          <p className="display-xl text-cream mt-4 text-[clamp(2rem,5.2vw,4rem)] drop-shadow-[0_2px_20px_rgba(0,0,0,0.55)]">
            {estate.city}
          </p>
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
