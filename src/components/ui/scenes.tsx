/**
 * Escenografía de respaldo dibujada en SVG.
 * Sostiene la composición mientras no exista la fotografía de la finca
 * (ver public/img/README.md) y no depende de ningún archivo externo.
 */

export function MountainScene({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-full w-full ${className}`}
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0c0f0a" />
          <stop offset="46%" stopColor="#20291c" />
          <stop offset="100%" stopColor="#5e5834" />
        </linearGradient>
        <radialGradient id="haze" cx="50%" cy="70%" r="46%">
          <stop offset="0%" stopColor="#d3ba82" stopOpacity="0.42" />
          <stop offset="55%" stopColor="#ac9256" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ac9256" stopOpacity="0" />
        </radialGradient>
        {/* Bruma entre cordilleras: cada plano se aclara con la distancia. */}
        <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5e5834" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#5e5834" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="1440" height="900" fill="url(#sky)" />
      <rect width="1440" height="900" fill="url(#haze)" />

      {/* Cordillera lejana */}
      <path
        d="M0 452 L150 386 L268 440 L392 348 L520 438 L648 372 L784 452 L918 386 L1052 448 L1182 380 L1312 444 L1440 396 L1440 900 L0 900Z"
        fill="#2b3423"
        opacity="0.55"
      />
      <rect y="430" width="1440" height="140" fill="url(#mist)" />

      {/* Cordillera media */}
      <path
        d="M0 556 L138 496 L296 574 L448 468 L610 566 L768 502 L926 588 L1086 512 L1242 582 L1382 508 L1440 546 L1440 900 L0 900Z"
        fill="#1d2617"
        opacity="0.85"
      />
      <rect y="540" width="1440" height="150" fill="url(#mist)" opacity="0.7" />

      {/* Ladera cercana */}
      <path
        d="M0 690 L182 626 L378 706 L570 634 L788 718 L1006 646 L1210 724 L1440 666 L1440 900 L0 900Z"
        fill="#121a0e"
      />
    </svg>
  );
}

/** Curvas de nivel: fondo de plano cartográfico para el pie de página. */
export function ContourScene({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-full w-full ${className}`}
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g fill="none" stroke="#ac9256" strokeWidth="1">
        {Array.from({ length: 14 }).map((_, index) => {
          const offset = index * 26;
          return (
            <path
              key={index}
              d={`M-40 ${140 + offset} C 180 ${60 + offset}, 380 ${230 + offset}, 600 ${150 + offset} S 1020 ${60 + offset}, 1240 ${170 + offset}`}
              opacity={1 - index * 0.05}
            />
          );
        })}
      </g>
    </svg>
  );
}
