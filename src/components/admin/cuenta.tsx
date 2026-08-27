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
 *
 * Sin almacén conectado no se enseña el formulario: unos campos que no dejan
 * escribir parecen una avería. Se enseña el camino que sí funciona hoy.
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
  return (
    <section className="mt-8 max-w-lg">
      <p className="font-display text-cream text-lg tracking-[0.08em]">Contraseña del panel</p>
      {puedeCambiar ? <Formulario /> : <SinAlmacen />}
    </section>
  );
}

/* ─────────────────── Cuando todavía no hay dónde guardar ─────────────────── */

function SinAlmacen() {
  return (
    <>
      <p className="border-gold/50 text-cream-dim mt-6 border-l-2 py-2 pl-4 text-sm leading-relaxed">
        Todavía no se puede cambiar desde aquí. Este sitio corre en Vercel, que no guarda archivos
        entre visitas: sin una base de datos conectada no hay dónde dejar la contraseña nueva. Por
        eso el formulario no aparece en vez de aparecer y no dejarte escribir.
      </p>

      <p className="label text-cream-faint mt-8">Para cambiarla hoy</p>
      <ol className="text-cream-dim mt-3 space-y-2 text-sm leading-relaxed">
        <Paso n={1}>
          Entra en <span className="text-cream">vercel.com</span> → proyecto{" "}
          <span className="text-cream">cafelecoin</span> → Settings → Environment Variables.
        </Paso>
        <Paso n={2}>
          Edita <code className="text-gold-light">ADMIN_PASSWORD</code> y escribe la nueva.
        </Paso>
        <Paso n={3}>
          En Deployments, «Redeploy» en el último. La clave nueva vale en cuanto termine.
        </Paso>
      </ol>

      <p className="label text-cream-faint mt-8">Para poder cambiarla desde aquí</p>
      <p className="text-cream-dim mt-3 text-sm leading-relaxed">
        Hace falta conectar la base de datos: en Vercel, Storage → Upstash for Redis, plan gratuito.
        Se vincula al proyecto y entonces aparece el formulario. Lo mismo hace falta para que los
        pedidos que entren queden guardados, así que resuelve las dos cosas de una vez.
      </p>
    </>
  );
}

function Paso({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="text-gold-light shrink-0">{n}.</span>
      <span>{children}</span>
    </li>
  );
}

/* ──────────────────────────── El formulario ──────────────────────────── */

function Formulario() {
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
    <>
      <p className="text-cream-faint mt-2 text-sm leading-relaxed">
        La contraseña que guardes aquí manda sobre la del entorno y se almacena cifrada. Al
        cambiarla se cierran las demás sesiones abiertas.
      </p>

      <form onSubmit={enviar} className="mt-8 space-y-5">
        <Campo
          etiqueta="Contraseña actual"
          valor={actual}
          cambiar={setActual}
          autoComplete="current-password"
        />
        <Campo
          etiqueta="Nueva contraseña"
          valor={nueva}
          cambiar={setNueva}
          autoComplete="new-password"
          pista={`Mínimo ${MINIMO} caracteres.`}
        />
        <Campo
          etiqueta="Repite la nueva"
          valor={repetida}
          cambiar={setRepetida}
          autoComplete="new-password"
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
          disabled={!completo || estado === "enviando"}
          className="label border-gold/50 text-gold-light hover:bg-gold/10 border px-6 py-3 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
        >
          {estado === "enviando" ? "Guardando…" : "Cambiar contraseña"}
        </button>
      </form>
    </>
  );
}

function Campo({
  etiqueta,
  valor,
  cambiar,
  autoComplete,
  pista,
}: {
  etiqueta: string;
  valor: string;
  cambiar: (valor: string) => void;
  autoComplete: string;
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
        className="border-forest-line bg-forest-soft/40 text-cream focus:border-gold/60 mt-2 w-full border px-4 py-3 outline-none"
      />
      {pista && <span className="text-cream-faint mt-1 block text-xs">{pista}</span>}
    </label>
  );
}
