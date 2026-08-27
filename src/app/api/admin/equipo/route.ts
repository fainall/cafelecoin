import { NextResponse } from "next/server";

import { agregarEmpleado, listarEquipo, quitarEmpleado } from "@/lib/admin/equipo";
import { exigirAdmin } from "@/lib/admin/guardia";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Quién tiene acceso al panel. Solo el administrador lo ve y lo cambia. */
export async function GET() {
  const { rechazo } = await exigirAdmin();
  if (rechazo) return rechazo;

  return NextResponse.json({ ok: true, equipo: await listarEquipo() });
}

export async function POST(request: Request) {
  const { rechazo } = await exigirAdmin();
  if (rechazo) return rechazo;

  const cuerpo = (await request.json().catch(() => null)) as {
    correo?: unknown;
    nombre?: unknown;
  } | null;

  const correo = typeof cuerpo?.correo === "string" ? cuerpo.correo.trim() : "";
  const nombre = typeof cuerpo?.nombre === "string" ? cuerpo.nombre.trim() : "";

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) {
    return NextResponse.json({ ok: false, error: "correo_invalido" }, { status: 422 });
  }
  if (nombre.length < 2) {
    return NextResponse.json({ ok: false, error: "nombre_corto" }, { status: 422 });
  }

  // La fecha la pone el servidor: la del navegador puede venir de cualquier
  // reloj, y esto es un registro de quién dio acceso y cuándo.
  const resultado = await agregarEmpleado(correo, nombre, new Date().toISOString());
  if (resultado !== "ok") {
    return NextResponse.json(
      { ok: false, error: resultado },
      { status: resultado === "ya_estaba" ? 409 : 503 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { rechazo } = await exigirAdmin();
  if (rechazo) return rechazo;

  const correo = new URL(request.url).searchParams.get("correo") ?? "";
  if (!correo.includes("@")) {
    return NextResponse.json({ ok: false, error: "correo_invalido" }, { status: 422 });
  }

  // Quitar el acceso no borra la casilla: el correo sigue existiendo.
  const quitado = await quitarEmpleado(correo);
  if (!quitado) {
    return NextResponse.json({ ok: false, error: "no_estaba" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
