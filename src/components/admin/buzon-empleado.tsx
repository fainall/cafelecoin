"use client";

import { Correo } from "./correo";

/**
 * Lo que ve alguien del equipo: su bandeja y nada más.
 *
 * No es el panel con pestañas escondidas — es otra pantalla. Ocultar botones
 * deja el resto a un clic de distancia en cuanto alguien mira la consola; aquí
 * sencillamente no se monta. El servidor tampoco se fía de esto: cada endpoint
 * comprueba el rol por su cuenta.
 */
export function BuzonEmpleado({ correo }: { correo: string }) {
  async function salir() {
    await fetch("/api/admin/sesion", { method: "DELETE" });
    window.location.reload();
  }

  return (
    <main className="bg-forest text-cream min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-[62rem]">
        <header className="border-forest-line flex flex-wrap items-baseline justify-between gap-4 border-b pb-6">
          <div>
            <p className="font-display text-sm tracking-[0.28em] uppercase">Le Coin · Correo</p>
            <p className="text-cream-faint mt-2 text-sm">{correo}</p>
          </div>
          <button
            onClick={salir}
            className="label text-cream-faint hover:text-gold-light transition-colors"
          >
            Cerrar sesión
          </button>
        </header>

        {/* Sin gestión de casillas: crear y borrar buzones es del administrador. */}
        <Correo gestionActiva={false} buzonActivo dominio="" casilla={correo} />
      </div>
    </main>
  );
}
