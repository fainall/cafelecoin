import { NextResponse } from "next/server";

import { exigirSesion } from "@/lib/admin/guardia";
import { enviarCorreo } from "@/lib/correo/buzon";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  const rechazo = await exigirSesion();
  if (rechazo) return rechazo;

  const cuerpo = (await request.json().catch(() => null)) as {
    para?: unknown;
    asunto?: unknown;
    cuerpo?: unknown;
  } | null;

  const para = typeof cuerpo?.para === "string" ? cuerpo.para.trim() : "";
  const asunto = typeof cuerpo?.asunto === "string" ? cuerpo.asunto.trim() : "";
  const texto = typeof cuerpo?.cuerpo === "string" ? cuerpo.cuerpo : "";

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(para)) {
    return NextResponse.json({ ok: false, error: "Destinatario inválido" }, { status: 422 });
  }
  if (!asunto || !texto.trim()) {
    return NextResponse.json({ ok: false, error: "Falta asunto o mensaje" }, { status: 422 });
  }

  try {
    const id = await enviarCorreo({ para, asunto, cuerpo: texto });
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error("[correo] no se pudo enviar", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 502 },
    );
  }
}
