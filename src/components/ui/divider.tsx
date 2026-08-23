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

interface TornEdgeProps extends DividerProps {
  /**
   * Cambia la silueta del desgarro. Dos costuras de la misma página no deben
   * compartir semilla: el mismo perfil repetido delata que es un recurso.
   */
  seed?: number;
}

/**
 * Borde de papel rasgado.
 *
 * El desgarro no se dibuja punto por punto: se rompe. Un `feTurbulence`
 * desplaza el canto recto de un rectángulo hasta deshilacharlo, igual que en la
 * apertura de la página —misma materia en los dos sitios—. Una polilínea a mano
 * siempre acaba delatándose: los segmentos son rectos y la amplitud, la misma.
 *
 * Tres capas, de atrás hacia delante:
 *
 *   sangría ── la tinta del café, medio paso por delante del canto
 *   sello ──── tapa los huecos hondos; el desgarro se ve, la mugre no
 *   canto ──── el borde rasgado de la superficie entrante
 *
 * Sin el sello, el desplazamiento arrastra transparencia por debajo del borde y
 * siembra motas oscuras dentro del papel.
 */
export function TornEdge({
  fill = "fill-paper",
  behind = "bg-forest",
  className = "",
  seed = 5,
}: TornEdgeProps) {
  const canto = `borde-canto-${seed}`;
  const sangria = `borde-sangria-${seed}`;

  return (
    <div
      className={`pointer-events-none relative -mb-px w-full ${behind} ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className={`block h-8 w-full sm:h-10 ${fill}`}
      >
        <defs>
          {/* Región fija en unidades del lienzo: el ruido no depende del ancho
              de la ventana. */}
          {[
            { id: canto, escala: 16, semilla: seed },
            { id: sangria, escala: 24, semilla: seed + 17 },
          ].map((capa) => (
            <filter
              key={capa.id}
              id={capa.id}
              filterUnits="userSpaceOnUse"
              x={-60}
              y={-20}
              width={1560}
              height={100}
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.016 0.022"
                numOctaves="4"
                seed={capa.semilla}
                result="fibra"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="fibra"
                scale={capa.escala}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          ))}
        </defs>

        {/* Los rectángulos se desbordan a los lados para que el filtro nunca
            deje ver su propio borde. */}
        <rect
          className="fill-stain"
          fillOpacity={0.35}
          x={-60}
          y={26}
          width={1560}
          height={140}
          filter={`url(#${sangria})`}
        />
        <rect x={-60} y={40} width={1560} height={140} />
        <rect x={-60} y={32} width={1560} height={140} filter={`url(#${canto})`} />
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
