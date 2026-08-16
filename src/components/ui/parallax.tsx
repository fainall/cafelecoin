"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Parallax por capas.
 *
 * Un único listener de scroll para todas las capas de la página, acumulado en
 * un `requestAnimationFrame`: se escribe solo `transform`, que el navegador
 * resuelve en el compositor sin recalcular diseño ni repintar.
 *
 * `speed` es la fracción del scroll que recorre la capa:
 *   0.30 → se queda atrás, se lee como lejana
 *   0     → acompaña a la página
 *  -0.12 → se adelanta, se lee como cercana
 */

type Subscriber = (scrollY: number) => void;

const subscribers = new Set<Subscriber>();
let frame = 0;
let listening = false;

function tick() {
  frame = 0;
  const y = window.scrollY;
  for (const notify of subscribers) notify(y);
}

function onScroll() {
  if (!frame) frame = requestAnimationFrame(tick);
}

function subscribe(notify: Subscriber) {
  subscribers.add(notify);

  if (!listening) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    listening = true;
  }

  notify(window.scrollY);

  return () => {
    subscribers.delete(notify);
    if (subscribers.size === 0 && listening) {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      listening = false;
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    }
  };
}

interface ParallaxLayerProps {
  speed: number;
  /** Desvanece la capa a medida que la portada sale de pantalla. */
  fade?: boolean;
  className?: string;
  children: ReactNode;
}

export function ParallaxLayer({
  speed,
  fade = false,
  className = "",
  children,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Quien pide menos movimiento no recibe ninguno.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    return subscribe((y) => {
      // El respaldo evita que la capa se congele si el navegador reporta 0.
      const viewport = window.innerHeight || 800;
      // Fuera de la portada no hay nada que animar.
      if (y > viewport * 1.3) return;

      node.style.transform = `translate3d(0, ${(y * speed).toFixed(2)}px, 0)`;
      if (fade) {
        node.style.opacity = String(Math.max(0, 1 - y / (viewport * 0.75)));
      }
    });
  }, [speed, fade]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}

interface ParallaxFrameProps {
  /** Recorrido vertical del contenido dentro del marco, en píxeles. */
  range?: number;
  /** Deriva horizontal, en píxeles. Da la sensación de recorrer el paisaje. */
  drift?: number;
  className?: string;
  children: ReactNode;
}

/**
 * Marco con desplazamiento interno, para bandas que están a mitad de página.
 *
 * A diferencia de ParallaxLayer —que se apoya en el scroll absoluto y solo
 * sirve en la portada—, aquí el avance se calcula respecto a la posición del
 * propio marco: 0 cuando entra por abajo, 1 cuando sale por arriba. El
 * contenido es más alto que el marco, así que nunca asoman los bordes.
 */
export function ParallaxFrame({
  range = 140,
  drift = 0,
  className = "",
  children,
}: ParallaxFrameProps) {
  const marco = useRef<HTMLDivElement>(null);
  const movil = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const exterior = marco.current;
    const interior = movil.current;
    if (!exterior || !interior) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    return subscribe(() => {
      const alto = window.innerHeight || 800;
      const rect = exterior.getBoundingClientRect();

      // Fuera de pantalla no se calcula nada.
      if (rect.bottom < -120 || rect.top > alto + 120) return;

      // El recorrido se acota a la holgura real del marco: en pantallas
      // angostas un valor fijo en píxeles dejaría ver el borde.
      const techoY = rect.height * 0.15;
      const techoX = rect.width * 0.15;
      const recorrido = Math.sign(range) * Math.min(Math.abs(range), techoY);
      const lateral = Math.sign(drift) * Math.min(Math.abs(drift), techoX);

      const avance = (alto - rect.top) / (alto + rect.height);
      const y = (avance - 0.5) * recorrido;
      const x = (avance - 0.5) * lateral;
      interior.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    });
  }, [range, drift]);

  return (
    <div ref={marco} className={`relative overflow-hidden ${className}`}>
      {/* Holgura en las cuatro direcciones: mayor que el recorrido máximo del
          contenido, para que nunca asome el borde del marco. */}
      <div
        ref={movil}
        className="absolute -inset-x-[18%] -top-[20%] h-[140%]"
        style={{ willChange: "transform" }}
      >
        {children}
      </div>
    </div>
  );
}
