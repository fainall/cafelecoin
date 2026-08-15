interface WordmarkProps {
  className?: string;
  /** Caja oscura como en el empaque; sobre fondo oscuro va sin ella. */
  boxed?: boolean;
}

/**
 * Logotipo reproducido del empaque: "café" en cuerpo pequeño sobre "Le Coin"
 * en grotesca. Sobre fondo oscuro se usa suelto; sobre claro, con su caja.
 */
export function Wordmark({ className = "", boxed = false }: WordmarkProps) {
  return (
    <svg viewBox="0 0 132 62" className={className} role="img" aria-label="café Le Coin">
      {boxed && <rect width="132" height="62" fill="#171c18" />}
      <text
        x={boxed ? 14 : 0}
        y="20"
        fill="currentColor"
        fontFamily="var(--font-sans), Arial, sans-serif"
        fontSize="12"
        fontWeight="400"
        opacity="0.75"
      >
        café
      </text>
      <text
        x={boxed ? 13 : -1}
        y="40"
        fill="currentColor"
        fontFamily="var(--font-sans), Arial, sans-serif"
        fontSize="21"
        fontWeight="600"
        letterSpacing="-0.4"
      >
        Le
      </text>
      <text
        x={boxed ? 13 : -1}
        y="58"
        fill="currentColor"
        fontFamily="var(--font-sans), Arial, sans-serif"
        fontSize="21"
        fontWeight="600"
        letterSpacing="-0.4"
      >
        Coin
      </text>
    </svg>
  );
}
