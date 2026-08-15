import type { ComponentType } from "react";

interface IconProps {
  className?: string;
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Cordillera y marca de origen: el eje cafetero. */
function OriginIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <circle cx="60" cy="60" r="43" {...stroke} strokeWidth={0.8} opacity={0.45} />
      <path {...stroke} d="M24 76 L44 50 L57 66 L74 40 L96 76 Z" />
      <path {...stroke} d="M68 50 L74 40 L80 50" opacity={0.7} />
      <circle cx="60" cy="88" r="2.5" fill="currentColor" />
    </svg>
  );
}

/** Rama con cerezas: la recolección selectiva. */
function SelectionIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <circle cx="60" cy="60" r="43" {...stroke} strokeWidth={0.8} opacity={0.45} />
      <path {...stroke} d="M40 88 C 52 74, 62 58, 68 38" />
      <path {...stroke} d="M54 70 c -10 -6, -12 -17, -5 -25 c 9 4, 12 16, 5 25 z" />
      <path {...stroke} d="M62 56 c 10 -6, 21 -2, 25 8 c -11 4, -20 1, -25 -8 z" />
      <circle cx="70" cy="76" r="6.5" {...stroke} />
      <circle cx="54" cy="86" r="5" {...stroke} opacity={0.75} />
    </svg>
  );
}

/** Bolsa con válvula desgasificadora. */
function PackagingIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <circle cx="60" cy="60" r="43" {...stroke} strokeWidth={0.8} opacity={0.45} />
      <path {...stroke} d="M44 40 h32 l4 44 q -20 4, -40 0 z" />
      <path {...stroke} d="M44 40 l-4 -6 h40 l-4 6" />
      <circle cx="60" cy="62" r="7" {...stroke} />
      <circle cx="60" cy="62" r="2.2" fill="currentColor" />
    </svg>
  );
}

export const featureIcons = {
  origin: OriginIcon,
  selection: SelectionIcon,
  packaging: PackagingIcon,
} satisfies Record<string, ComponentType<IconProps>>;

export type FeatureIconId = keyof typeof featureIcons;
