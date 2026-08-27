import { NextResponse } from "next/server";

import { exigirAdmin } from "@/lib/admin/guardia";
import { getAdminRepository } from "@/lib/admin/repositorio";
import { orderStatuses, type OrderStatus } from "@/lib/orders/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Cambia el estado de un pedido: pagado, despachado, entregado, cancelado. */
export async function PATCH(request: Request) {
  const { rechazo } = await exigirAdmin();
  if (rechazo) return rechazo;

  const cuerpo = (await request.json().catch(() => null)) as {
    code?: unknown;
    status?: unknown;
  } | null;

  const code = typeof cuerpo?.code === "string" ? cuerpo.code : "";
  const status = cuerpo?.status as OrderStatus;

  if (!code || !orderStatuses.includes(status)) {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 422 });
  }

  const cambiado = await getAdminRepository().setOrderStatus(code, status);
  if (!cambiado) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
