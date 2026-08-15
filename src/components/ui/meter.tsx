import { Reveal } from "./reveal";
import { surfaces, type Tone } from "./surface";

const MAX = 10;

interface MeterProps {
  label: string;
  /** Intensidad 0–10. */
  value: number;
  /** Texto que reemplaza al número (p. ej. "Medio" en tueste). */
  display?: string;
  delay?: number;
  tone?: Tone;
}

/**
 * Fila de dato sensorial: etiqueta, barra de un pixel y valor tabular.
 * Se lee como una ficha de catación, no como un indicador de videojuego.
 */
export function Meter({ label, value, display, delay = 0, tone = "light" }: MeterProps) {
  const ratio = Math.min(Math.max(value, 0), MAX) / MAX;
  const s = surfaces[tone];

  return (
    <Reveal className="group" delay={delay}>
      <div
        className={`grid grid-cols-[7rem_1fr_4rem] items-center gap-5 border-b py-4 ${s.line}`}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={MAX}
        aria-valuenow={value}
        aria-label={`${label}: ${display ?? `${value} de ${MAX}`}`}
      >
        <span className={`meta ${s.muted}`}>{label}</span>

        <span className={`relative block h-px ${s.rule}`} aria-hidden="true">
          <span
            className="bg-cherry absolute inset-y-0 left-0 origin-left scale-x-0 transition-transform duration-[900ms] ease-out group-data-[visible=true]:scale-x-100"
            style={{ width: `${ratio * 100}%`, transitionDelay: `${delay + 120}ms` }}
          />
        </span>

        <span className={`index text-right tabular-nums ${s.text}`}>{display ?? value}</span>
      </div>
    </Reveal>
  );
}
