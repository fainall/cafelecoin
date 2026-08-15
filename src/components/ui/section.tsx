import type { ReactNode } from "react";

import { Reveal } from "./reveal";
import { surfaces, type Tone } from "./surface";

interface SectionProps {
  id?: string;
  tone?: Tone;
  children: ReactNode;
  className?: string;
  /** Sin relleno vertical: para bandas fotográficas a sangre. */
  flush?: boolean;
}

/** Contenedor con la retícula y los márgenes del sitio. */
export function Section({
  id,
  tone = "dark",
  children,
  className = "",
  flush = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`relative scroll-mt-20 ${surfaces[tone].bg} ${flush ? "" : "py-28 sm:py-36 lg:py-44"} ${className}`}
    >
      <div className="mx-auto w-full max-w-[100rem] px-6 sm:px-10 lg:px-16">{children}</div>
    </section>
  );
}

interface SectionHeadProps {
  /** Número de orden dentro del recorrido: 01, 02, 03… */
  index: string;
  label: string;
  title: string;
  lede?: string;
  tone?: Tone;
  className?: string;
}

/**
 * Cabecera de sección alineada a la izquierda sobre la retícula:
 * índice y etiqueta en la columna angosta, título y entradilla en la ancha.
 */
export function SectionHead({
  index,
  label,
  title,
  lede,
  tone = "dark",
  className = "",
}: SectionHeadProps) {
  const s = surfaces[tone];

  return (
    <Reveal as="header" className={`grid gap-8 lg:grid-cols-12 lg:gap-12 ${className}`}>
      <div className="lg:col-span-3">
        <div className={`flex items-baseline gap-4 border-t pt-4 ${s.line}`}>
          <span className={`index ${tone === "dark" ? "text-cherry-bright" : "text-cherry"}`}>
            {index}
          </span>
          <span className={`meta ${s.muted}`}>{label}</span>
        </div>
      </div>

      <div className="lg:col-span-9">
        <h2 className={`display text-[clamp(2.5rem,6vw,5rem)] ${s.text}`}>{title}</h2>
        {lede && <p className={`prose-editorial mt-8 ${s.muted}`}>{lede}</p>}
      </div>
    </Reveal>
  );
}
