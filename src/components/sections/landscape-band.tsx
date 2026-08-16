import { LandscapeBackdrop } from "@/components/ui/landscape-backdrop";

/**
 * Transición fotográfica entre dos secciones de papel.
 *
 * Es una banda a sangre, sin texto: el paisaje de origen en cuatro planos que
 * se separan al desplazarse (ver LandscapeBackdrop). Funciona como respiro
 * entre el relato de marca y el ciclo de producción.
 */
export function LandscapeBand() {
  return (
    <section className="bg-forest relative h-[72svh] max-h-[640px] min-h-[360px] overflow-hidden">
      {/* Velo mínimo: no hay texto que sostener, solo se asienta la banda
          contra el papel de arriba y de abajo. */}
      <LandscapeBackdrop veil="linear-gradient(to bottom, rgba(15,19,13,0.34) 0%, rgba(15,19,13,0.04) 22%, rgba(15,19,13,0.04) 78%, rgba(15,19,13,0.3) 100%)" />
    </section>
  );
}
