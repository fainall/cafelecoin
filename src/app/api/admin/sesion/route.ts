import { NextResponse } from "next/server";

import { adminHabilitado, comprobarPassword, COOKIE, crearSesion } from "@/lib/admin/sesion";
import { clientIp, createMemoryRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Cinco intentos cada cuarto de hora: suficiente para el despiste de quien
// gestiona la tienda, inútil para probar contraseñas a ciegas.
const limiter = createMemoryRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });

export async function POST(request: Request) {
  if (!adminHabilitado()) {
    return NextResponse.json({ ok: false, error: "admin_disabled" }, { status: 503 });
  }

  const rate = await limiter.check(`admin:${clientIp(request.headers)}`);
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "retry-after": String(rate.retryAfter) } },
    );
  }

  const cuerpo = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof cuerpo?.password === "string" ? cuerpo.password : "";

  if (!comprobarPassword(password)) {
    return NextResponse.json({ ok: false, error: "bad_password" }, { status: 401 });
  }

  const sesion = crearSesion();
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

/** Cerrar sesión. */
export async function DELETE() {
  const respuesta = NextResponse.json({ ok: true });
  respuesta.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
  return respuesta;
}
