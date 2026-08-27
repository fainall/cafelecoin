import { NextResponse } from "next/server";

import { estaEnEquipo, normalizar } from "@/lib/admin/equipo";
import {
  adminHabilitado,
  comprobarPassword,
  COOKIE,
  crearSesionAdmin,
  crearSesionEmpleado,
  type CookieSesion,
} from "@/lib/admin/sesion";
import { credencialesValidas, servidorHabilitado } from "@/lib/correo/buzon";
import { clientIp, createMemoryRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Validar a un empleado abre una conexión IMAP: no es instantáneo.
export const maxDuration = 30;

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

  const cuerpo = (await request.json().catch(() => null)) as {
    password?: unknown;
    correo?: unknown;
  } | null;

  const password = typeof cuerpo?.password === "string" ? cuerpo.password : "";
  const correo = typeof cuerpo?.correo === "string" ? normalizar(cuerpo.correo) : "";

  const sesion = correo ? await entrarComoEmpleado(correo, password) : await entrarComoAdmin(password);
  if (!sesion) {
    return NextResponse.json({ ok: false, error: "bad_password" }, { status: 401 });
  }

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

async function entrarComoAdmin(password: string): Promise<CookieSesion | null> {
  return (await comprobarPassword(password)) ? crearSesionAdmin() : null;
}

/**
 * Dos puertas seguidas y las dos tienen que abrirse: la lista del
 * administrador dice quién puede entrar, y el servidor de correo dice si la
 * contraseña es suya. Ni una casilla real sin autorizar, ni una autorizada sin
 * su clave.
 */
async function entrarComoEmpleado(
  correo: string,
  password: string,
): Promise<CookieSesion | null> {
  if (!servidorHabilitado() || !password) return null;
  if (!(await estaEnEquipo(correo))) return null;
  if (!(await credencialesValidas({ usuario: correo, password }))) return null;

  return crearSesionEmpleado(correo, password);
}

/** Cerrar sesión. */
export async function DELETE() {
  const respuesta = NextResponse.json({ ok: true });
  respuesta.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
  return respuesta;
}
