import "server-only";

import type { StoredOrder } from "./schema";

/**
 * Destino de un pedido confirmado.
 *
 * Mismo patrón que las solicitudes de muestras: la tienda no sabe dónde
 * terminan los pedidos. Hoy un archivo o un correo, mañana un ERP.
 *
 * OJO: sin un destino duradero, un pedido solo queda en el registro del
 * servidor, que se rota. En Vercel eso significa perderlo en un día.
 */
export interface OrderStore {
  readonly name: string;
  save(order: StoredOrder): Promise<void>;
}

export const consoleOrderStore: OrderStore = {
  name: "console",
  async save(order) {
    console.info("[pedido]", JSON.stringify(order));
  },
};

/** Append-only NDJSON. Útil en desarrollo y en servidores con disco propio. */
export const fileOrderStore: OrderStore = {
  name: "file",
  async save(order) {
    const { appendFile, mkdir } = await import("node:fs/promises");
    const path = await import("node:path");

    const destino = process.env.ORDERS_FILE ?? path.join(process.cwd(), ".data", "pedidos.ndjson");
    await mkdir(path.dirname(destino), { recursive: true });
    await appendFile(destino, `${JSON.stringify(order)}\n`, "utf8");
  },
};

/** Reenvía el pedido a un webhook (ERP, hoja de cálculo, Make, n8n). */
export const webhookOrderStore: OrderStore = {
  name: "webhook",
  async save(order) {
    const url = process.env.ORDERS_WEBHOOK_URL;
    if (!url) throw new Error("ORDERS_WEBHOOK_URL no está configurada");

    const respuesta = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(order),
    });
    if (!respuesta.ok) throw new Error(`Webhook respondió ${respuesta.status}`);
  },
};

/** Redis por su API HTTP: el único destino duradero que además se puede leer. */
export const redisOrderStore: OrderStore = {
  name: "redis",
  async save(order) {
    const { redisPush } = await import("@/lib/admin/repositorio");
    await redisPush("orders", order);
  },
};

/** Aviso por correo vía Resend, para que el pedido llegue a alguien. */
export const emailOrderStore: OrderStore = {
  name: "email",
  async save(order) {
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.ORDERS_EMAIL_TO ?? process.env.LEADS_EMAIL_TO;
    const from = process.env.ORDERS_EMAIL_FROM ?? process.env.LEADS_EMAIL_FROM;
    if (!apiKey || !to || !from) {
      throw new Error("Faltan RESEND_API_KEY, ORDERS_EMAIL_TO u ORDERS_EMAIL_FROM");
    }

    const productos = order.items
      .map(
        (item) =>
          `<tr><td>${item.quantity} × ${escapeHtml(item.label)}</td><td align="right">${item.subtotal.amount.toLocaleString("es-CL")} ${item.subtotal.currency}</td></tr>`,
      )
      .join("");

    const datos = Object.entries({
      Cliente: order.name,
      Correo: order.email,
      Teléfono: order.phone,
      Dirección: `${order.address}, ${order.city}, ${order.region} (${order.country})`,
      Notas: order.notes ?? "—",
      Cobro: order.payment,
    })
      .map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${escapeHtml(String(v))}</td></tr>`)
      .join("");

    const respuesta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        from,
        to: to.split(",").map((address) => address.trim()),
        reply_to: order.email,
        subject: `Pedido ${order.code} — ${order.total.amount.toLocaleString("es-CL")} ${order.total.currency}`,
        html: `<h2>Pedido ${order.code}</h2><table>${productos}<tr><td><strong>Total</strong></td><td align="right"><strong>${order.total.amount.toLocaleString("es-CL")} ${order.total.currency}</strong></td></tr></table><h3>Despacho</h3><table>${datos}</table>`,
      }),
    });
    if (!respuesta.ok) throw new Error(`Resend respondió ${respuesta.status}`);
  },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ─────────────────────────────── Composición ─────────────────────────────── */

const registro: Record<string, OrderStore> = {
  console: consoleOrderStore,
  file: fileOrderStore,
  redis: redisOrderStore,
  webhook: webhookOrderStore,
  email: emailOrderStore,
};

/** Escribe en varios destinos: solo falla si fallan todos. */
export function compositeOrderStore(stores: OrderStore[]): OrderStore {
  return {
    name: stores.map((store) => store.name).join("+"),
    async save(order) {
      const resultados = await Promise.allSettled(stores.map((store) => store.save(order)));

      resultados.forEach((resultado, indice) => {
        if (resultado.status === "rejected") {
          console.error(`[pedido] destino "${stores[indice].name}" falló:`, resultado.reason);
        }
      });

      if (resultados.every((resultado) => resultado.status === "rejected")) {
        throw new Error("Ningún destino pudo registrar el pedido");
      }
    },
  };
}

let cache: OrderStore | null = null;

export function getOrderStore(): OrderStore {
  if (cache) return cache;

  // Con Redis configurado se usa solo: es el que alimenta el panel.
  const hayRedis = Boolean(process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL);
  const porDefecto = hayRedis ? "redis,console" : process.env.VERCEL ? "console" : "file,console";
  const pedidos = (process.env.ORDERS_STORE ?? porDefecto)
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  const stores = pedidos.map((name) => {
    const store = registro[name];
    if (!store) throw new Error(`Destino de pedidos desconocido: "${name}"`);
    return store;
  });

  const duraderos = stores.filter((store) => store.name !== "console");
  if (duraderos.length === 0) {
    console.warn(
      "[pedidos] No hay destino duradero configurado. Define ORDERS_STORE=email o webhook, " +
        "o los pedidos se perderán con la rotación de registros.",
    );
  }

  cache = stores.length === 1 ? stores[0] : compositeOrderStore(stores);
  return cache;
}
