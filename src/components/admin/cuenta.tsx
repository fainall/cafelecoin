"use client";

import { useState } from "react";

/**
 * Cambio de contraseña del panel.
 *
 * Pide la actual además de la nueva: la sesión sola no basta, porque una
 * pantalla dejada abierta no debería poder quedarse con el panel para siempre.
 *
 * Al guardar, el servidor devuelve una cookie nueva —la anterior iba firmada
 * con la clave vieja—, así que quien cambia la clave sigue dentro y cualquier
 * otra sesión abierta se cae. Es lo que se espera de un cambio de contraseña.
 */

const MINIMO = 8;

const MENSAJE: Record<string, string> = {
  actual_incorrecta: "La contraseña actual no es esa.",
  nueva_corta: `La nueva necesita al menos ${MINIMO} caracteres.`,
  sin_almacen: "No hay dónde guardarla: falta conectar el almacén.",
  rate_limited: "Demasiados intentos seguidos. Espera un cuarto de hora.",
  unauthorized: "La sesión caducó. Vuelve a entrar.",
};

export function Cuenta({ puedeCambiar }: { puedeCambiar: boolean }) {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [repetida, setRepetida] = useState("");
  const [estado, setEstado] = useState<"quieto" | "enviando" | "listo">("quieto");
  const [error, setError] = useState<string | null>(null);

  const desajuste = repetida.length > 0 && nueva !== repetida;
  const completo = actual.length > 0 && nueva.length >= MINIMO && nueva === repetida;

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setEstado("enviando");
    setError(null);

    const respuesta = await fetch("/api/admin/password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ actual, nueva }),
    }).catch(() => null);

    if (!respuesta?.ok) {
      const cuerpo = (await respuesta?.json().catch(() => null)) as { error?: string } | null;
      setError(MENSAJE[cuerpo?.error ?? ""] ?? "No se pudo cambiar la contraseña.");
      setEstado("quieto");
      return;
    }

    setActual("");
    setNueva("");
    setRepetida("");
    setEstado("listo");
  }

  return (
    <section className="mt-8 max-w-lg">
      <p className="font-display text-cream text-lg tracking-[0.08em]">Contraseña del panel</p>
      <p className="text-cream-faint mt-2 text-sm leading-relaxed">
        La contraseña que guardes aquí manda sobre la del entorno y se almacena cifrada. Al
        cambiarla se cierran las demás sesiones abiertas.
      </p>

      {!puedeCambiar && (
        <p className="border-danger/50 text-cream-dim mt-6 border-l-2 py-2 pl-4 text-sm">
          Ahora mismo no hay almacén conectado, así que no habría dónde guardar la nueva clave.
          Conecta Redis (Upstash) desde Vercel y este formulario empieza a funcionar. Mientras
          tanto, la contraseña se cambia en las variables de entorno de Vercel.
        </p>
      )}

      <form onSubmit={enviar} className="mt-8 space-y-5">
        <Campo
          etiqueta="Contraseña actual"
          valor={actual}
          cambiar={setActual}
          autoComplete="current-password"
          desactivado={!puedeCambiar}
        />
        <Campo
          etiqueta="Nueva contraseña"
          valor={nueva}
          cambiar={setNueva}
          autoComplete="new-password"
          desactivado={!puedeCambiar}
          pista={`Mínimo ${MINIMO} caracteres.`}
        />
        <Campo
          etiqueta="Repite la nueva"
          valor={repetida}
          cambiar={setRepetida}
          autoComplete="new-password"
          desactivado={!puedeCambiar}
          pista={desajuste ? "Las dos no coinciden." : undefined}
        />

        {error && <p className="text-danger text-sm">{error}</p>}
        {estado === "listo" && (
          <p className="text-sm text-emerald-300">
            Contraseña cambiada. Usa la nueva la próxima vez que entres.
          </p>
        )}

        <button
          type="submit"
          disabled={!puedeCambiar || !completo || estado === "enviando"}
          className="label border-gold/50 text-gold-light hover:bg-gold/10 border px-6 py-3 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
        >
          {estado === "enviando" ? "Guardando…" : "Cambiar contraseña"}
        </button>
      </form>
    </section>
  );
}

function Campo({
  etiqueta,
  valor,
  cambiar,
  autoComplete,
  desactivado,
  pista,
}: {
  etiqueta: string;
  valor: string;
  cambiar: (valor: string) => void;
  autoComplete: string;
  desactivado: boolean;
  pista?: string;
}) {
  return (
    <label className="block">
      <span className="label text-cream-faint">{etiqueta}</span>
      <input
        type="password"
        value={valor}
        onChange={(evento) => cambiar(evento.target.value)}
        autoComplete={autoComplete}
        disabled={desactivado}
        className="border-forest-line bg-forest-soft/40 text-cream focus:border-gold/60 mt-2 w-full border px-4 py-3 outline-none disabled:opacity-40"
      />
      {pista && <span className="text-cream-faint mt-1 block text-xs">{pista}</span>}
    </label>
  );
}
