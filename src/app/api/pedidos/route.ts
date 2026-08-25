import { NextResponse } from "next/server";

import { content } from "@/content";
import { formatWeight } from "@/content/helpers";
import { getPrimaryPhone } from "@/content/helpers";
import { summarize } from "@/lib/cart/cart";
import { fieldErrors, OrderInputSchema, orderCode, type StoredOrder } from "@/lib/orders/schema";
import { getOrderStore } from "@/lib/orders/store";
import { getPaymentProvider } from "@/lib/payments/provider";
import { clientIp, createMemoryRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const limiter = createMemoryRateLimiter({ limit: 10, windowMs: 10 * 60 * 1000 });

export async function POST(request: Request) {
  const ip = clientIp(request.headers);
  const rate = await limiter.check(`pedidos:${ip}`);

  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "retry-after": String(rate.retryAfter) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = OrderInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_error", fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const { website, lines, ...comprador } = parsed.data;

  // Trampa anti-spam completada: se responde bien para no darle señal al bot.
  if (website) {
    return NextResponse.json({ ok: true, code: "LC-IGNORADO", handoff: null });
  }

  // El precio se recalcula aquí SIEMPRE. Lo que llegó del navegador es una
  // lista de deseos, no una factura.
  const [formats, contact] = await Promise.all([content.getFormats(), content.getContact()]);
  const resumen = summarize(lines, formats, "retail");

  if (resumen.lines.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "empty_order",
        fields: { lines: "Ningún producto del pedido está disponible" },
      },
      { status: 422 },
    );
  }

  const order: StoredOrder = {
    ...comprador,
    code: orderCode(),
    items: resumen.lines.map((line) => ({
      formatId: line.format.id,
      label: formatWeight(line.format.grams, comprador.locale),
      quantity: line.quantity,
      unit: line.unit,
      subtotal: line.subtotal,
    })),
    total: resumen.total,
    weightGrams: resumen.weightGrams,
    status: "pendiente",
    payment: getPaymentProvider().name,
    placedAt: new Date().toISOString(),
    userAgent: request.headers.get("user-agent") ?? undefined,
  };

  // Primero se registra y después se cobra: un pedido que nadie apuntó y que
  // el comprador sí pagó es mucho peor que uno registrado que no se pagó.
  try {
    await getOrderStore().save(order);
  } catch (error) {
    console.error("[pedidos] no se pudo registrar el pedido", error);
    return NextResponse.json({ ok: false, error: "storage_error" }, { status: 502 });
  }

  try {
    const handoff = await getPaymentProvider().start(order, {
      siteUrl: contact.siteUrl.replace(/\/$/, ""),
      whatsappNumber: getPrimaryPhone(contact).e164.replace(/\D/g, ""),
    });

    return NextResponse.json(
      { ok: true, code: order.code, total: order.total, handoff },
      { status: 201 },
    );
  } catch (error) {
    console.error("[pedidos] la pasarela falló", error);
    // El pedido ya quedó guardado: se avisa para que se cierre a mano.
    return NextResponse.json(
      {
        ok: true,
        code: order.code,
        total: order.total,
        handoff: null,
        warning: "payment_unavailable",
      },
      { status: 201 },
    );
  }
}
