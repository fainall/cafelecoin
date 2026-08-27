import { NextResponse } from "next/server";

import { exigirSesion } from "@/lib/admin/guardia";
import { borrarCasilla, crearCasilla, listarCasillas } from "@/lib/correo/cpanel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const rechazo = await exigirSesion();
  if (rechazo) return rechazo;

  try {
    return NextResponse.json({ ok: true, casillas: await listarCasillas() });
  } catch (error) {
    console.error("[correo] no se pudieron listar las casillas", error);
    return NextResponse.json({ ok: false, error: mensaje(error) }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const rechazo = await exigirSesion();
  if (rechazo) return rechazo;

  const cuerpo = (await request.json().catch(() => null)) as {
    nombre?: unknown;
    password?: unknown;
    cuotaMb?: unknown;
  } | null;

  const nombre = typeof cuerpo?.nombre === "string" ? cuerpo.nombre.trim().toLowerCase() : "";
  const password = typeof cuerpo?.password === "string" ? cuerpo.password : "";
  const cuotaMb = Number(cuerpo?.cuotaMb ?? 1024);

  // El nombre va sin arroba: el dominio lo pone el servidor, no el navegador.
  if (!/^[a-z0-9._-]{1,64}$/.test(nombre)) {
    return NextResponse.json(
      { ok: false, error: "Usa solo letras, números, punto, guion y guion bajo" },
      { status: 422 },
    );
  }
  if (password.length < 12) {
    return NextResponse.json(
      { ok: false, error: "La contraseña necesita al menos 12 caracteres" },
      { status: 422 },
    );
  }

  try {
    await crearCasilla(nombre, password, Number.isFinite(cuotaMb) ? cuotaMb : 1024);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[correo] no se pudo crear la casilla", error);
    return NextResponse.json({ ok: false, error: mensaje(error) }, { status: 502 });
  }
}

export async function DELETE(request: Request) {
  const rechazo = await exigirSesion();
  if (rechazo) return rechazo;

  const email = new URL(request.url).searchParams.get("email") ?? "";
  if (!email.includes("@")) {
    return NextResponse.json({ ok: false, error: "Dirección inválida" }, { status: 422 });
  }

  try {
    await borrarCasilla(email);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[correo] no se pudo borrar la casilla", error);
    return NextResponse.json({ ok: false, error: mensaje(error) }, { status: 502 });
  }
}

const mensaje = (error: unknown) => (error instanceof Error ? error.message : "Error desconocido");
