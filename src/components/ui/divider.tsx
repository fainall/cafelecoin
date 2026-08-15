/**
 * Transiciones entre superficies.
 *
 * `behind` es el color de la superficie que TERMINA (queda detrás del recorte) y
 * `fill` el de la que EMPIEZA. Sin `behind` el recorte se ve contra el fondo del
 * documento y la silueta desaparece cuando ambos coinciden.
 */

interface DividerProps {
  /** Relleno de la superficie entrante, p. ej. "fill-paper" o "fill-forest". */
  fill?: string;
  /** Fondo de la superficie saliente, p. ej. "bg-paper" o "bg-forest". */
  behind?: string;
  className?: string;
}

/** Borde de papel rasgado: irregular y de amplitud corta, como un desgarro real. */
export function TornEdge({
  fill = "fill-paper",
  behind = "bg-forest",
  className = "",
}: DividerProps) {
  return (
    <div
      className={`pointer-events-none relative -mb-px w-full ${behind} ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1440 40" preserveAspectRatio="none" className={`block h-7 w-full ${fill}`}>
        <path d="M0 40 L0 21 L26 25 L54 15 L78 22 L108 12 L134 21 L166 11 L196 20 L228 13 L254 23 L286 16 L318 24 L344 14 L378 22 L408 12 L436 21 L468 15 L496 23 L528 13 L556 22 L588 16 L618 24 L648 14 L676 21 L708 12 L738 22 L766 15 L798 23 L828 13 L858 21 L888 16 L918 24 L948 14 L978 22 L1008 12 L1038 21 L1066 15 L1098 23 L1128 13 L1156 22 L1188 16 L1218 24 L1248 14 L1278 21 L1308 12 L1338 22 L1368 15 L1400 23 L1440 17 L1440 40 Z" />
      </svg>
    </div>
  );
}

/**
 * Silueta de cordillera con dos planos: la cresta lejana en menor opacidad da
 * la sensación de bruma entre montañas.
 */
export function RidgeEdge({
  fill = "fill-forest",
  behind = "bg-paper",
  className = "",
}: DividerProps) {
  return (
    <div
      className={`pointer-events-none relative -mb-px w-full ${behind} ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        className={`block h-24 w-full sm:h-32 lg:h-40 ${fill}`}
      >
        <path
          d="M0 220 L0 150 L104 118 L182 146 L268 96 L352 132 L446 78 L534 120 L618 92 L706 134 L790 104 L876 146 L962 110 L1048 150 L1132 116 L1218 150 L1300 122 L1372 152 L1440 128 L1440 220 Z"
          opacity="0.45"
        />
        <path d="M0 220 L0 186 L92 162 L176 188 L264 146 L346 180 L432 138 L522 176 L608 150 L694 184 L780 156 L868 190 L954 162 L1040 194 L1126 166 L1212 196 L1298 172 L1376 198 L1440 176 L1440 220 Z" />
      </svg>
    </div>
  );
}
