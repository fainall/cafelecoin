import { NextResponse } from "next/server";

import { exigirSesion } from "@/lib/admin/guardia";
import { cambiarPassword, COOKIE, crearSesion } from "@/lib/admin/sesion";
import { clientIp, createMemoryRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Pide la contraseña actual, así que es otra puerta por donde probar claves.
// Se limita igual que la de entrada.
const limiter = createMemoryRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });

/** Cambia la contraseña del panel y renueva la sesión de quien la cambió. */
export async function POST(request: Request) {
  const rechazo = await exigirSesion();
  if (rechazo) return rechazo;

  const rate = await limiter.check(`admin-pass:${clientIp(request.headers)}`);
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "retry-after": String(rate.retryAfter) } },
    );
  }

  const cuerpo = (await request.json().catch(() => null)) as {
    actual?: unknown;
    nueva?: unknown;
  } | null;

  const actual = typeof cuerpo?.actual === "string" ? cuerpo.actual : "";
  const nueva = typeof cuerpo?.nueva === "string" ? cuerpo.nueva : "";

  const resultado = await cambiarPassword(actual, nueva);
  if (resultado !== "ok") {
    // 409 en «sin_almacen»: la petición es correcta, lo que falta es dónde
    // guardarla. 422 y 401 son culpa de lo que se escribió.
    const estado = { actual_incorrecta: 401, nueva_corta: 422, sin_almacen: 409 }[resultado];
    return NextResponse.json({ ok: false, error: resultado }, { status: estado });
  }

  // La cookie vieja iba firmada con la clave anterior: sin esto, cambiar la
  // contraseña echaría del panel a quien acaba de cambiarla.
  const sesion = await crearSesion();
  const respuesta = NextResponse.json({ ok: true });
  respuesta.cookies.set(COOKIE, sesion.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sesion.maxAge,
  });
  return respuesta;
}
