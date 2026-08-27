import { NextResponse } from "next/server";

import { casilleroDe, exigirSesion } from "@/lib/admin/guardia";
import { leerBandeja, leerMensaje } from "@/lib/correo/buzon";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// IMAP abre conexión, autentica y cierra en cada llamada: no es instantáneo.
export const maxDuration = 30;

export async function GET(request: Request) {
  const { sesion, rechazo } = await exigirSesion();
  if (rechazo) return rechazo;

  const casillero = casilleroDe(sesion);
  if (!casillero) {
    return NextResponse.json({ ok: false, error: "sin_casilla" }, { status: 503 });
  }

  const uid = new URL(request.url).searchParams.get("uid");

  try {
    if (uid) {
      const mensaje = await leerMensaje(casillero, Number(uid));
      if (!mensaje) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
      return NextResponse.json({ ok: true, mensaje });
    }

    return NextResponse.json({ ok: true, mensajes: await leerBandeja(casillero) });
  } catch (error) {
    console.error("[correo] no se pudo leer la bandeja", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 502 },
    );
  }
}
