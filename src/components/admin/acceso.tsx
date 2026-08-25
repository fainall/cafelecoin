"use client";

import { useState, type FormEvent } from "react";

/** Pantalla de acceso al panel: una contraseña y nada más. */
export function Acceso() {
  const [estado, setEstado] = useState<"idle" | "enviando" | "error">("idle");

  async function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEstado("enviando");

    const password = new FormData(evento.currentTarget).get("password");

    const respuesta = await fetch("/api/admin/sesion", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);

    if (respuesta?.ok) {
      // Recarga para que la página vuelva a renderizarse ya con sesión.
      window.location.reload();
      return;
    }

    setEstado("error");
  }

  return (
    <main className="bg-forest text-cream flex min-h-screen items-center justify-center px-6">
      <form onSubmit={entrar} className="border-forest-line w-full max-w-sm border p-10">
        <p className="font-display text-cream text-sm tracking-[0.28em] uppercase">
          Le Coin · Administración
        </p>

        <label htmlFor="password" className="label text-cream-faint mt-8 block">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="border-forest-line text-cream focus:border-gold mt-2 w-full border-b bg-transparent py-3 font-sans text-sm transition-colors focus:outline-none"
        />

        <button
          type="submit"
          disabled={estado === "enviando"}
          className="bg-gold text-forest-deep font-display hover:bg-gold-light mt-8 w-full px-9 py-4 text-[0.72rem] tracking-[0.22em] uppercase transition-colors disabled:opacity-50"
        >
          {estado === "enviando" ? "Entrando…" : "Entrar"}
        </button>

        {estado === "error" && (
          <p role="alert" className="text-danger mt-5 text-sm">
            Contraseña incorrecta. Tras varios intentos hay que esperar un rato.
          </p>
        )}
      </form>
    </main>
  );
}
