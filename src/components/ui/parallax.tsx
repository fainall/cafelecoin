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
