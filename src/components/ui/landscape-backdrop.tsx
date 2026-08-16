import { ParallaxFrame } from "./parallax";
import { Photo } from "./photo";

/**
 * Paisaje de origen en cuatro planos, como fondo de una sección.
 *
 * Cada capa es una fotografía recortada contra el cielo
 * (scripts/separar-capas.mjs) y se desplaza a distinta velocidad y con distinta
 * deriva lateral: el cielo casi quieto, la ladera de cafetos adelantándose. Al
 * bajar, la sección se recorre en vez de mirarse.
 *
 * Va detrás del contenido y bajo un velo del color de la superficie, así que el
 * texto conserva su contraste; el paisaje queda como atmósfera, no como imagen
 * protagonista.
 */

const planos = [
  // Fondo: se queda muy atrás.
  { src: "/img/cielo.webp", range: 150, drift: -20, z: "z-0" },
  { src: "/img/cerro-lejano.webp", range: 105, drift: -55, z: "z-[1]" },
  { src: "/img/cerro-medio.webp", range: 45, drift: -120, z: "z-[2]" },
  // Primer plano: se adelanta a la página.
  { src: "/img/cerro-cercano.webp", range: -70, drift: -210, z: "z-[3]" },
];

interface LandscapeBackdropProps {
  /** Velo sobre el paisaje, en notación CSS. Debe dejar legible el texto. */
  veil: string;
  className?: string;
}

export function LandscapeBackdrop({ veil, className = "" }: LandscapeBackdropProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {planos.map((plano) => (
        <div key={plano.src} className={`absolute inset-0 ${plano.z}`}>
          <ParallaxFrame range={plano.range} drift={plano.drift} className="h-full w-full">
            <Photo
              src={plano.src}
              alt=""
              sizes="100vw"
              className="h-full w-full"
              fallback={<span />}
            />
          </ParallaxFrame>
        </div>
      ))}

      <div className="absolute inset-0 z-[4]" style={{ background: veil }} />
    </div>
  );
}
