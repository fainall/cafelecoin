import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { COOKIE, sesionValida } from "./sesion";

/**
 * Portero común de los endpoints del panel.
 *
 * Repetir la comprobación en cada ruta es la forma habitual de que un día
 * falte en una: mejor una sola función que devuelva la respuesta de rechazo.
 */
export async function exigirSesion(): Promise<NextResponse | null> {
  const galleta = (await cookies()).get(COOKIE)?.value;
  if (sesionValida(galleta)) return null;
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}
