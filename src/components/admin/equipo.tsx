"use client";

import { useEffect, useState } from "react";

/**
 * Quién del equipo entra al panel.
 *
 * Aquí no se ponen contraseñas: cada persona entra con la de su propia
 * casilla, la misma del webmail. Esta lista solo dice quién está autorizado.
 * Por eso dar de alta a alguien no le crea nada — la casilla se crea en la
 * pestaña Correo, y puede existir desde antes.
 */

interface Empleado {
  correo: string;
  nombre: string;
  desde: string;
}

const MENSAJE: Record<string, string> = {
  correo_invalido: "Esa dirección no parece válida.",
  nombre_corto: "Escribe el nombre de la persona.",
  ya_estaba: "Esa dirección ya tenía acceso.",
  sin_almacen: "No hay dónde guardar la lista: falta conectar el almacén.",
  forbidden: "Solo el administrador puede hacer esto.",
};

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });

export function Equipo({
  puedeGestionar,
  dominio,
}: {
  puedeGestionar: boolean;
  dominio: string;
}) {
  // Sin gestión no se pide nada, así que el estado ya nace resuelto.
  const [equipo, setEquipo] = useState<Empleado[] | null>(puedeGestionar ? null : []);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!puedeGestionar) return;

    let vivo = true;
    fetch("/api/admin/equipo")
      .then((r) => r.json())
      .then((r: { ok?: boolean; equipo?: Empleado[] }) => {
        if (vivo) setEquipo(r.ok ? (r.equipo ?? []) : []);
      })
      .catch(() => {
        if (vivo) setEquipo([]);
      });

    return () => {
      vivo = false;
    };
  }, [puedeGestionar]);

  const recargar = async () => {
    const r = (await fetch("/api/admin/equipo").then((x) => x.json())) as { equipo?: Empleado[] };
    setEquipo(r.equipo ?? []);
  };

  async function agregar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setGuardando(true);
    setError(null);

    const formulario = evento.currentTarget;
    const datos = new FormData(formulario);

    const respuesta = await fetch("/api/admin/equipo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correo: datos.get("correo"), nombre: datos.get("nombre") }),
    }).catch(() => null);

    if (respuesta?.ok) {
      formulario.reset();
      await recargar();
    } else {
      const cuerpo = (await respuesta?.json().catch(() => null)) as { error?: string } | null;
      setError(MENSAJE[cuerpo?.error ?? ""] ?? "No se pudo dar el acceso.");
    }
    setGuardando(false);
  }

  async function quitar(correo: string) {
    if (!confirm(`Quitar el acceso al panel de ${correo}?\n\nSu casilla y su correo no se tocan.`))
      return;

    setGuardando(true);
    await fetch(`/api/admin/equipo?correo=${encodeURIComponent(correo)}`, { method: "DELETE" });
    await recargar();
    setGuardando(false);
  }

  if (!puedeGestionar) {
    return (
      <section className="mt-8 max-w-lg">
        <p className="font-display text-cream text-lg tracking-[0.08em]">Equipo</p>
        <p className="border-gold/50 text-cream-dim mt-6 border-l-2 py-2 pl-4 text-sm leading-relaxed">
          Falta conectar el almacén para poder guardar la lista de quién tiene acceso. Sin él, solo
          entra el administrador.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8 max-w-2xl">
      <p className="font-display text-cream text-lg tracking-[0.08em]">Quién entra al panel</p>
      <p className="text-cream-faint mt-2 text-sm leading-relaxed">
        Cada persona entra con la contraseña de su propia casilla, la misma del webmail — aquí no se
        fijan contraseñas. Quien esté en esta lista verá <strong>solo su bandeja</strong>: ni
        pedidos, ni solicitudes, ni el correo de nadie más.
      </p>

      <form onSubmit={agregar} className="mt-8 flex flex-wrap items-end gap-4">
        <label className="min-w-[12rem] flex-1">
          <span className="label text-cream-faint">Nombre</span>
          <input
            name="nombre"
            required
            placeholder="Fernando"
            className="border-forest-line bg-forest-soft/40 text-cream focus:border-gold/60 placeholder:text-cream-faint/40 mt-2 w-full border px-4 py-3 outline-none"
          />
        </label>
        <label className="min-w-[14rem] flex-1">
          <span className="label text-cream-faint">Correo</span>
          <input
            name="correo"
            type="email"
            required
            placeholder={`nombre@${dominio}`}
            className="border-forest-line bg-forest-soft/40 text-cream focus:border-gold/60 placeholder:text-cream-faint/40 mt-2 w-full border px-4 py-3 outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={guardando}
          className="label border-gold/50 text-gold-light hover:bg-gold/10 border px-6 py-3 transition-colors disabled:opacity-40"
        >
          Dar acceso
        </button>
      </form>

      {error && <p className="text-danger mt-4 text-sm">{error}</p>}

      {equipo === null ? (
        <p className="text-cream-faint py-10 text-sm">Cargando…</p>
      ) : equipo.length === 0 ? (
        <p className="text-cream-dim py-10 text-sm">
          Todavía no hay nadie del equipo con acceso. Solo entra el administrador.
        </p>
      ) : (
        <ul className="border-forest-line mt-8 border-t">
          {equipo.map((empleado) => (
            <li
              key={empleado.correo}
              className="border-forest-line flex flex-wrap items-center justify-between gap-4 border-b py-4"
            >
              <div>
                <p className="text-cream">{empleado.nombre}</p>
                <p className="text-cream-faint mt-1 text-sm">
                  {empleado.correo} · desde el {fecha(empleado.desde)}
                </p>
              </div>
              <button
                onClick={() => quitar(empleado.correo)}
                disabled={guardando}
                className="label text-cream-faint hover:text-danger transition-colors disabled:opacity-40"
              >
                Quitar acceso
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
