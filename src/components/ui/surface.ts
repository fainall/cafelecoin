/**
 * El sitio alterna dos superficies. Los componentes que aparecen en ambas
 * reciben el tono como prop en lugar de duplicarse.
 */
export type Tone = "dark" | "light";

export const surfaces = {
  dark: {
    bg: "bg-ink",
    raised: "bg-ink-raised",
    text: "text-bone",
    muted: "text-bone-muted",
    line: "border-ink-line",
    rule: "bg-ink-line",
  },
  light: {
    bg: "bg-paper",
    raised: "bg-paper-raised",
    text: "text-graphite",
    muted: "text-graphite-muted",
    line: "border-paper-line",
    rule: "bg-paper-line",
  },
} as const satisfies Record<Tone, Record<string, string>>;
