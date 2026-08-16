import { ParallaxFrame } from "./parallax";
import { Photo } from "./photo";

/**
 * Paisaje de origen en dos planos.
 *
 * Al fondo, los cerros de cafetales completos; delante, la ladera en fruto
 * recortada por luminosidad (scripts/separar-capas.mjs). Cada plano se desplaza
 * a distinta velocidad y con distinta deriva lateral, de modo que al bajar el
 * paisaje se recorre en vez de mirarse.
 *
 * Fueron cuatro planos y se veía mal: recortar crestas lejanas en un paisaje
 * con bruma dibujaba una línea ondulada con halo, porque ahí no hay borde que
 * cortar. Solo se recorta lo que tiene contraste real: la vegetación cercana.
 */

const planos = [
  // Fondo: se queda atrás.
  { src: "/img/cerros.webp", range: 95, drift: -45, z: "z-0" },
  // Primer plano: se adelanta a la página.
  { src: "/img/cafetal-frente.webp", range: -65, drift: -180, z: "z-[1]" },
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
