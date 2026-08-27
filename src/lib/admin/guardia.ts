import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { COOKIE, leerSesion, type Sesion } from "./sesion";
import { casilleroDelEntorno, type Casillero } from "@/lib/correo/buzon";

/**
 * Portero común de los endpoints del panel.
 *
 * Repetir la comprobación en cada ruta es la forma habitual de que un día
 * falte en una: mejor una función que devuelva o la sesión, o la respuesta de
 * rechazo ya hecha. El tipo obliga a mirar las dos cosas.
 */

export type Guardia = { sesion: Sesion; rechazo?: never } | { sesion?: never; rechazo: NextResponse };

const noAutorizado = () =>
  NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

/** Cualquier sesión válida: administrador o empleado. */
export async function exigirSesion(): Promise<Guardia> {
  const galleta = (await cookies()).get(COOKIE)?.value;
  const sesion = await leerSesion(galleta);
  return sesion ? { sesion } : { rechazo: noAutorizado() };
}

/** Solo administrador. Un empleado con sesión válida recibe 403, no 401. */
export async function exigirAdmin(): Promise<Guardia> {
  const guardia = await exigirSesion();
  if (guardia.rechazo) return guardia;

  if (guardia.sesion.rol !== "admin") {
    return { rechazo: NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 }) };
  }
  return guardia;
}

/**
 * La casilla que le toca abrir a esta sesión. El administrador usa la del
 * entorno; el empleado, la suya. No hay forma de pedir la de otro: la
 * dirección no se lee de la petición, sale de la cookie firmada.
 */
export function casilleroDe(sesion: Sesion): Casillero | null {
  if (sesion.rol === "admin") return casilleroDelEntorno();
  if (!sesion.correo || !sesion.claveCorreo) return null;
  return { usuario: sesion.correo, password: sesion.claveCorreo };
}
