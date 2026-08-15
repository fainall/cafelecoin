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
 * Silueta de cordillera.
 *
 * Una sola cresta, con laderas curvas y cimas de altura y separación
 * irregulares: un perfil de sierra regular delata el recurso gráfico. Se
 * conserva la proporción del dibujo (`xMidYMax meet` no sirve a ancho completo,
 * así que el trazado ya viene diseñado para estirarse sin acartonarse).
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
        viewBox="0 0 1440 300"
        preserveAspectRatio="none"
        className={`block h-28 w-full sm:h-40 lg:h-52 ${fill}`}
      >
        {/* Cimas en arista y faldas curvas: el perfil solo redondeado parece
            una loma; el solo anguloso, una sierra de plantilla. */}
        <path
          d="M0 300 L0 214
             C 58 210, 98 196, 142 182
             L 236 92
             C 254 78, 272 78, 290 92
             L 358 170
             C 390 198, 416 202, 448 192
             L 528 128
             C 552 110, 574 112, 596 132
             L 664 194
             C 694 212, 722 210, 750 196
             L 858 96
             C 878 82, 898 82, 916 98
             L 992 178
             C 1020 200, 1048 202, 1078 190
             L 1158 136
             C 1182 120, 1204 122, 1224 142
             L 1304 204
             C 1338 218, 1378 210, 1406 196
             L 1440 182
             L 1440 300 Z"
        />
      </svg>
    </div>
  );
}
