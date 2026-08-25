import "server-only";

import type { StoredOrder } from "@/lib/orders/schema";

/**
 * Cómo se cobra un pedido.
 *
 * La tienda no sabe quién cobra: hoy Mercado Pago o un cierre por WhatsApp,
 * mañana Webpay o Khipu. Basta con implementar esta interfaz.
 *
 * El proveedor no cobra: devuelve a dónde tiene que ir el comprador para
 * pagar. Quién confirma el pago es el webhook, no esta llamada.
 */
export interface PaymentHandoff {
  /** "redirect" abre la pasarela; "whatsapp" abre la conversación. */
  kind: "redirect" | "whatsapp";
  url: string;
}

export interface PaymentProvider {
  readonly name: string;
  start(order: StoredOrder, context: PaymentContext): Promise<PaymentHandoff>;
}

export interface PaymentContext {
  /** Origen público del sitio, para las URLs de retorno. */
  siteUrl: string;
  /** Teléfono de la marca en formato internacional sin signos. */
  whatsappNumber: string;
}

/* ─────────────────────────────── Mercado Pago ─────────────────────────────── */

/**
 * Checkout Pro: se crea una preferencia y se manda al comprador a `init_point`.
 *
 * Se usa la API HTTP directamente en vez del SDK: es una sola llamada, y así no
 * se arrastra una dependencia que hay que mantener al día por un POST.
 */
export const mercadoPagoProvider: PaymentProvider = {
  name: "mercadopago",

  async start(order, { siteUrl }) {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN no está configurada");

    const respuesta = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        // Evita cobrar dos veces si la petición se reintenta.
        "x-idempotency-key": order.code,
      },
      body: JSON.stringify({
        external_reference: order.code,
        items: order.items.map((item) => ({
          id: item.formatId,
          title: `Café Le Coin ${item.label}`,
          quantity: item.quantity,
          unit_price: item.unit.amount,
          currency_id: item.unit.currency,
        })),
        payer: {
          name: order.name,
          email: order.email,
          phone: { number: order.phone },
          address: {
            street_name: order.address,
            zip_code: "",
          },
        },
        back_urls: {
          success: `${siteUrl}/${order.locale}/pedido?estado=exito&codigo=${order.code}`,
          pending: `${siteUrl}/${order.locale}/pedido?estado=pendiente&codigo=${order.code}`,
          failure: `${siteUrl}/${order.locale}/pedido?estado=fallo&codigo=${order.code}`,
        },
        auto_return: "approved",
        notification_url: `${siteUrl}/api/pagos/mercadopago`,
        statement_descriptor: "CAFE LE COIN",
      }),
    });

    if (!respuesta.ok) {
      const detalle = await respuesta.text().catch(() => "");
      throw new Error(`Mercado Pago respondió ${respuesta.status}: ${detalle.slice(0, 300)}`);
    }

    const datos = (await respuesta.json()) as { init_point?: string; sandbox_init_point?: string };
    // Con credenciales de prueba solo viene el punto de sandbox.
    const destino = datos.init_point ?? datos.sandbox_init_point;
    if (!destino) throw new Error("Mercado Pago no devolvió punto de pago");

    return { kind: "redirect", url: destino };
  },
};

/* ─────────────────────────────── WhatsApp ─────────────────────────────── */

const MONEDA: Record<string, string> = { CLP: "$", COP: "$", ARS: "$", USD: "US$" };

function lineaDePedido(order: StoredOrder): string {
  const simbolo = MONEDA[order.total.currency] ?? "";
  const productos = order.items
    .map(
      (item) =>
        `• ${item.quantity} × ${item.label} — ${simbolo}${item.subtotal.amount.toLocaleString("es-CL")}`,
    )
    .join("\n");

  return [
    `Hola, quiero confirmar mi pedido ${order.code}.`,
    "",
    productos,
    `Total: ${simbolo}${order.total.amount.toLocaleString("es-CL")} ${order.total.currency}`,
    "",
    `Nombre: ${order.name}`,
    `Despacho: ${order.address}, ${order.city}, ${order.region}`,
  ].join("\n");
}

/**
 * Cierre por WhatsApp mientras no haya pasarela conectada.
 *
 * No es un parche: el pedido queda registrado igual, con su código y su total
 * calculados en el servidor. Lo único que cambia es por dónde se paga. Para
 * una venta directa en Chile es un cierre perfectamente normal.
 */
export const whatsappProvider: PaymentProvider = {
  name: "whatsapp",

  async start(order, { whatsappNumber }) {
    const texto = encodeURIComponent(lineaDePedido(order));
    return { kind: "whatsapp", url: `https://wa.me/${whatsappNumber}?text=${texto}` };
  },
};

/* ─────────────────────────────── Selección ─────────────────────────────── */

const registro: Record<string, PaymentProvider> = {
  mercadopago: mercadoPagoProvider,
  whatsapp: whatsappProvider,
};

/**
 * Sin PAGOS_PROVEEDOR, se elige solo: si hay credenciales de Mercado Pago se
 * cobra por ahí, y si no se cierra por WhatsApp. Así el día que aparezca el
 * token no hay que tocar código ni acordarse de cambiar nada.
 */
export function getPaymentProvider(): PaymentProvider {
  const pedido = process.env.PAGOS_PROVEEDOR?.trim();

  if (pedido) {
    const proveedor = registro[pedido];
    if (!proveedor) throw new Error(`Proveedor de pago desconocido: "${pedido}"`);
    return proveedor;
  }

  return process.env.MERCADOPAGO_ACCESS_TOKEN ? mercadoPagoProvider : whatsappProvider;
}
