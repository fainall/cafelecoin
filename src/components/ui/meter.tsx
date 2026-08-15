import { Reveal } from "./reveal";
import { surfaces, type Tone } from "./surface";

const SEGMENTS = 10;

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
 * Barra segmentada del perfil sensorial. Los segmentos se encienden en cascada
 * al entrar en viewport, sin JavaScript adicional.
 */
export function Meter({ label, value, display, delay = 0, tone = "dark" }: MeterProps) {
  const filled = Math.round(Math.min(Math.max(value, 0), SEGMENTS));
  const s = surfaces[tone];
  const empty = tone === "dark" ? "bg-forest-line" : "bg-paper-line";

  return (
    <Reveal className="group" delay={delay}>
      <div
        className={`flex items-center gap-5 border-b py-3.5 ${s.line}`}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={SEGMENTS}
        aria-valuenow={value}
        aria-label={`${label}: ${display ?? `${value} de ${SEGMENTS}`}`}
      >
        <span className={`label w-24 shrink-0 ${s.faint}`}>{label}</span>

        <span className="flex flex-1 gap-1.5" aria-hidden="true">
          {Array.from({ length: SEGMENTS }).map((_, index) => (
            <span
              key={index}
              data-on={index < filled}
              style={{ transitionDelay: `${delay + index * 55}ms` }}
              className={`h-1.5 flex-1 transition-colors duration-500 ${empty} data-[on=true]:group-data-[visible=true]:bg-gold`}
            />
          ))}
        </span>

        <span className={`font-display w-16 shrink-0 text-right text-sm ${s.heading}`}>
          {display ?? value}
        </span>
      </div>
    </Reveal>
  );
}
