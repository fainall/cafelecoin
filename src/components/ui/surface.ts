/**
 * El sitio alterna dos superficies: papel crema y verde profundo.
 * Los componentes que aparecen en ambas reciben el tono como prop en lugar
 * de duplicarse.
 */
export type Tone = "dark" | "paper";

export const surfaces = {
  dark: {
    bg: "bg-forest",
    raised: "bg-forest-soft",
    heading: "text-cream",
    text: "text-cream-dim",
    faint: "text-cream-faint",
    line: "border-forest-line",
    rule: "bg-forest-line",
    accent: "text-gold-light",
  },
  paper: {
    bg: "bg-paper",
    raised: "bg-paper-soft",
    heading: "text-ink",
    text: "text-ink-soft",
    faint: "text-ink-soft",
    line: "border-paper-line",
    rule: "bg-paper-line",
    accent: "text-gold-deep",
  },
} as const satisfies Record<Tone, Record<string, string>>;
