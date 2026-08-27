"use client";

import { useState, type FormEvent } from "react";

/**
 * Pantalla de acceso.
 *
 * Dos entradas separadas en vez de un formulario que adivine: quien administra
 * escribe una contraseña, quien trabaja escribe su correo y la clave de su
 * casilla — la misma del webmail, no una nueva. Mezclarlas en un solo campo
 * ahorraría un clic y costaría una explicación en cada alta.
 */
export function Acceso({ equipoActivo }: { equipoActivo: boolean }) {
  const [modo, setModo] = useState<"admin" | "equipo">("admin");
  const [estado, setEstado] = useState<"idle" | "enviando" | "error">("idle");

  async function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEstado("enviando");

    const datos = new FormData(evento.currentTarget);
    const respuesta = await fetch("/api/admin/sesion", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        password: datos.get("password"),
        correo: modo === "equipo" ? datos.get("correo") : undefined,
      }),
    }).catch(() => null);

    if (respuesta?.ok) {
      // Recarga para que la página vuelva a renderizarse ya con sesión.
      window.location.reload();
      return;
    }

    setEstado("error");
  }

  const equipo = modo === "equipo";

  return (
    <main className="bg-forest text-cream flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="font-display text-cream text-center text-sm tracking-[0.28em] uppercase">
          Le Coin · Administración
        </p>

        {equipoActivo && (
          <div className="border-forest-line mt-8 flex border-b">
            {(["admin", "equipo"] as const).map((cual) => (
              <button
                key={cual}
                type="button"
                onClick={() => {
                  setModo(cual);
                  setEstado("idle");
                }}
                data-activo={modo === cual}
                className="label text-cream-faint data-[activo=true]:border-gold data-[activo=true]:text-gold-light -mb-px flex-1 border-b-2 border-transparent pb-3 transition-colors"
              >
                {cual === "admin" ? "Administración" : "Mi correo"}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={entrar}
          // La clave remonta el formulario al cambiar de modo: si no, el
          // navegador conserva lo escrito y autocompleta en el campo que no es.
          key={modo}
          className="border-forest-line mt-8 border p-10"
        >
          {equipo && (
            <>
              <label htmlFor="correo" className="label text-cream-faint block">
                Tu correo
              </label>
              <input
                id="correo"
                name="correo"
                type="email"
                required
                autoFocus
                autoComplete="username"
                placeholder="nombre@lecoin.cl"
                className="border-forest-line text-cream focus:border-gold placeholder:text-cream-faint/50 mt-2 mb-7 w-full border-b bg-transparent py-3 font-sans text-sm transition-colors focus:outline-none"
              />
            </>
          )}

          <label htmlFor="password" className="label text-cream-faint block">
            {equipo ? "Contraseña de tu correo" : "Contraseña"}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus={!equipo}
            autoComplete="current-password"
            className="border-forest-line text-cream focus:border-gold mt-2 w-full border-b bg-transparent py-3 font-sans text-sm transition-colors focus:outline-none"
          />

          {equipo && (
            <p className="text-cream-faint mt-3 text-xs leading-relaxed">
              La misma que usas en el webmail. Aquí verás solo tu bandeja.
            </p>
          )}

          <button
            type="submit"
            disabled={estado === "enviando"}
            className="bg-gold text-forest-deep font-display hover:bg-gold-light mt-8 w-full px-9 py-4 text-[0.72rem] tracking-[0.22em] uppercase transition-colors disabled:opacity-50"
          >
            {estado === "enviando" ? "Entrando…" : "Entrar"}
          </button>

          {estado === "error" && (
            <p role="alert" className="text-danger mt-5 text-sm">
              {equipo
                ? "No pudimos entrar. Revisa el correo y la contraseña, y que tengas acceso concedido."
                : "Contraseña incorrecta. Tras varios intentos hay que esperar un rato."}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
