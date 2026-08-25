import "server-only";

import type { StoredLead } from "./schema";

/**
 * Destino de una solicitud de muestras.
 *
 * El sitio no sabe dónde terminan los leads: hoy un archivo NDJSON o un correo,
 * mañana un CRM. Basta con implementar esta interfaz y declararla en LEADS_STORE.
 */
export interface LeadStore {
  readonly name: string;
  save(lead: StoredLead): Promise<void>;
}

/* ───────────────────────────── Implementaciones ───────────────────────────── */

export const consoleLeadStore: LeadStore = {
  name: "console",
  async save(lead) {
    console.info("[lead]", JSON.stringify(lead));
  },
};

/** Append-only NDJSON. Útil en desarrollo y en servidores con disco persistente. */
export const fileLeadStore: LeadStore = {
  name: "file",
  async save(lead) {
    const { appendFile, mkdir } = await import("node:fs/promises");
    const path = await import("node:path");

    const target = process.env.LEADS_FILE ?? path.join(process.cwd(), ".data", "leads.ndjson");
    await mkdir(path.dirname(target), { recursive: true });
    await appendFile(target, `${JSON.stringify(lead)}\n`, "utf8");
  },
};

/** Reenvía el lead a un webhook (Zapier, Make, Slack, n8n, CRM propio). */
export const webhookLeadStore: LeadStore = {
  name: "webhook",
  async save(lead) {
    const url = process.env.LEADS_WEBHOOK_URL;
    if (!url) throw new Error("LEADS_WEBHOOK_URL no está configurada");

    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(lead),
    });
    if (!response.ok) {
      throw new Error(`Webhook respondió ${response.status}`);
    }
  },
};

/** Redis por su API HTTP: duradero y legible desde el panel. */
export const redisLeadStore: LeadStore = {
  name: "redis",
  async save(lead) {
    const { redisPush } = await import("@/lib/admin/repositorio");
    await redisPush("leads", lead);
  },
};

/** Notificación por correo vía Resend (sin SDK: solo su API HTTP). */
export const emailLeadStore: LeadStore = {
  name: "email",
  async save(lead) {
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.LEADS_EMAIL_TO;
    const from = process.env.LEADS_EMAIL_FROM;
    if (!apiKey || !to || !from) {
      throw new Error("Faltan RESEND_API_KEY, LEADS_EMAIL_TO o LEADS_EMAIL_FROM");
    }

    const rows = Object.entries({
      Empresa: lead.company,
      Contacto: lead.name,
      Correo: lead.email,
      Teléfono: lead.phone ?? "—",
      País: lead.country,
      Operación: lead.channel,
      "Volumen (kg/mes)": lead.monthlyVolumeKg ?? "—",
      Formatos: lead.formatIds.join(", ") || "—",
      Lote: lead.lotSlug ?? "—",
      Idioma: lead.locale,
      Mensaje: lead.message ?? "—",
    })
      .map(
        ([key, value]) =>
          `<tr><td><strong>${key}</strong></td><td>${escapeHtml(String(value))}</td></tr>`,
      )
      .join("");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: to.split(",").map((address) => address.trim()),
        reply_to: lead.email,
        subject: `Solicitud de productos — ${lead.company}`,
        html: `<h2>Nueva solicitud de productos</h2><table>${rows}</table><p>${lead.id} · ${lead.receivedAt}</p>`,
      }),
    });
    if (!response.ok) {
      throw new Error(`Resend respondió ${response.status}`);
    }
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

const registry: Record<string, LeadStore> = {
  console: consoleLeadStore,
  file: fileLeadStore,
  redis: redisLeadStore,
  webhook: webhookLeadStore,
  email: emailLeadStore,
};

/**
 * Escribe en varios destinos a la vez. Solo falla si fallan todos:
 * que se caiga el webhook no debe perder el lead que sí quedó en disco.
 */
export function compositeLeadStore(stores: LeadStore[]): LeadStore {
  return {
    name: stores.map((store) => store.name).join("+"),
    async save(lead) {
      const results = await Promise.allSettled(stores.map((store) => store.save(lead)));

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(`[lead] destino "${stores[index].name}" falló:`, result.reason);
        }
      });

      if (results.every((result) => result.status === "rejected")) {
        throw new Error("Ningún destino de leads pudo registrar la solicitud");
      }
    },
  };
}

let cached: LeadStore | null = null;

/**
 * LEADS_STORE acepta una lista separada por comas: "file,email".
 * Por defecto se usa archivo + consola, que funciona sin configuración previa.
 */
export function getLeadStore(): LeadStore {
  if (cached) return cached;

  // En Vercel el disco es de solo lectura, así que "file" siempre fallaría:
  // ahí el valor por defecto no lo incluye.
  const hayRedis = Boolean(process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL);
  const porDefecto = hayRedis ? "redis,console" : process.env.VERCEL ? "console" : "file,console";

  const requested = (process.env.LEADS_STORE ?? porDefecto)
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  const stores = requested.map((name) => {
    const store = registry[name];
    if (!store) throw new Error(`Destino de leads desconocido: "${name}"`);
    return store;
  });

  // Sin un destino duradero las solicitudes solo quedan en el log del servidor,
  // que se rota y se pierde. Vale la pena gritarlo en el arranque.
  const duraderos = stores.filter((store) => store.name !== "console");
  if (duraderos.length === 0) {
    console.warn(
      "[leads] No hay destino duradero configurado. Define LEADS_STORE=email o webhook, " +
        "o las solicitudes de muestras se perderán.",
    );
  }

  cached = stores.length === 1 ? stores[0] : compositeLeadStore(stores);
  return cached;
}
