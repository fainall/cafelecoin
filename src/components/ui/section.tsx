import type { ReactNode } from "react";

import { Reveal } from "./reveal";
import { surfaces, type Tone } from "./surface";

interface SectionProps {
  id?: string;
  tone?: Tone;
  children: ReactNode;
  className?: string;
  /** Ancho de lectura reducido para bloques centrados. */
  narrow?: boolean;
  /**
   * Fondo que ocupa toda la sección, por detrás del contenido.
   * Va como hermano del contenedor y no dentro de él: un hermano posicionado
   * pinta por encima de los bloques estáticos, así que el contenido necesita
   * su propio nivel para no quedar tapado.
   */
  backdrop?: ReactNode;
}

export function Section({
  id,
  tone = "dark",
  children,
  className = "",
  narrow = false,
  backdrop,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`relative scroll-mt-24 py-24 sm:py-32 lg:py-40 ${surfaces[tone].bg} ${backdrop ? "overflow-hidden" : ""} ${className}`}
    >
      {backdrop}

      <div
        className={`mx-auto w-full px-6 sm:px-10 lg:px-16 ${backdrop ? "relative z-10" : ""} ${narrow ? "max-w-3xl" : "max-w-[82rem]"}`}
      >
        {children}
      </div>
    </section>
  );
}

interface SectionHeadingProps {
  /** Palabra pequeña sobre el título: "Nuestro", "Lo que". */
  eyebrow: string;
  title: string;
  tone?: Tone;
  className?: string;
}

/**
 * Encabezado ceremonial: antetítulo pequeño, título romano y filete central.
 * Siempre centrado.
 */
export function SectionHeading({
  eyebrow,
  title,
  tone = "dark",
  className = "",
}: SectionHeadingProps) {
  const s = surfaces[tone];

  return (
    <Reveal as="header" className={`text-center ${className}`}>
      <p className={`eyebrow ${s.accent}`}>{eyebrow}</p>
      <h2 className={`display-xl mt-5 text-[clamp(2rem,4.6vw,3.6rem)] ${s.heading}`}>{title}</h2>
      <div className={`flourish mt-7 ${s.accent}`}>
        <span className="block h-1.5 w-1.5 rotate-45 bg-current" />
      </div>
    </Reveal>
  );
}
