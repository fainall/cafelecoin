/**
 * Apertura de la página: un velo de papel que se abre como una mancha de café
 * al empaparse.
 *
 * Son dos veladuras dentro de la misma máscara. La de papel va delante y la
 * teñida va un paso atrás, así que entre ambas queda una franja húmeda que
 * barre la pantalla: el gesto de la acuarela, no un círculo que crece.
 *
 * El borde no se dibuja, se rompe: un `feTurbulence` desplaza el contorno del
 * círculo hasta deshilacharlo. El filtro va en el grupo de fuera y la escala en
 * el de dentro —nunca al revés—, porque la fibra del papel no crece con la
 * mancha: lo que avanza es el agua. Con el filtro dentro de la escala, el grano
 * se agranda y deja pegotes de papel varados en las esquinas.
 *
 * Componente de servidor, sin una línea de JavaScript: la animación vive en CSS
 * y termina en `forwards`, de modo que el velo se retira aunque el script del
 * sitio nunca llegue a ejecutarse. Con `prefers-reduced-motion`, la regla
 * global de globals.css lo apaga al instante.
 */
export function Apertura() {
  return (
    <div className="apertura" aria-hidden="true">
      <svg className="apertura__lienzo" viewBox="0 0 120 120" preserveAspectRatio="xMidYMid slice">
        <defs>
          {/* Núcleo opaco y orilla que se desvanece: la mancha no tiene filo. */}
          <radialGradient id="apertura-borde">
            <stop offset="0%" stopColor="#000" />
            <stop offset="72%" stopColor="#000" />
            <stop offset="100%" stopColor="#fff" />
          </radialGradient>

          {/* Región fija en unidades del lienzo: el coste del ruido no depende
              de cuánto haya crecido la mancha. */}
          <filter
            id="apertura-fibra-a"
            filterUnits="userSpaceOnUse"
            x={-24}
            y={-24}
            width={168}
            height={168}
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.14"
              numOctaves="2"
              seed="7"
              result="fibra"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="fibra"
              scale="9"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* Otra semilla y otro grano: las dos veladuras no avanzan con el
              mismo dibujo. */}
          <filter
            id="apertura-fibra-b"
            filterUnits="userSpaceOnUse"
            x={-24}
            y={-24}
            width={168}
            height={168}
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.11"
              numOctaves="2"
              seed="31"
              result="fibra"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="fibra"
              scale="12"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* Blanco = velo presente. La mancha negra es el hueco por donde
              asoma la página. */}
          <mask id="apertura-hueco-a">
            <rect width="120" height="120" fill="#fff" />
            <g filter="url(#apertura-fibra-a)">
              <g className="apertura__mancha">
                <circle cx="60" cy="60" r="30" fill="url(#apertura-borde)" />
              </g>
            </g>
          </mask>

          <mask id="apertura-hueco-b">
            <rect width="120" height="120" fill="#fff" />
            <g filter="url(#apertura-fibra-b)">
              <g className="apertura__mancha apertura__mancha--rezagada">
                <circle cx="60" cy="60" r="30" fill="url(#apertura-borde)" />
              </g>
            </g>
          </mask>
        </defs>

        {/* Detrás: el agua teñida, siempre un paso atrás. */}
        <rect className="apertura__tinte" width="120" height="120" mask="url(#apertura-hueco-b)" />
        {/* Delante: el papel. */}
        <rect className="apertura__papel" width="120" height="120" mask="url(#apertura-hueco-a)" />
      </svg>
    </div>
  );
}
