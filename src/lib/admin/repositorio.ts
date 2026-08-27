import "server-only";

import type { StoredLead } from "@/lib/leads/schema";
import type { OrderStatus, StoredOrder } from "@/lib/orders/schema";

/**
 * Lado de lectura del panel.
 *
 * Los almacenes de pedidos y solicitudes solo saben escribir: son buzones. El
 * panel necesita lo contrario —listar y corregir—, y eso pide un respaldo que
 * de verdad guarde, no un registro que se rota.
 *
 * Hay dos: un archivo NDJSON para servidores con disco propio, y Redis por su
 * API HTTP para los que no lo tienen, como Vercel. Se elige solo según lo que
 * haya configurado; sin ninguno, el panel lo dice en vez de mentir con una
 * tabla vacía.
 */

export type Backend = "archivo" | "redis" | "ninguno";

export interface AdminRepository {
  readonly backend: Backend;
  listOrders(): Promise<StoredOrder[]>;
  listLeads(): Promise<StoredLead[]>;
  setOrderStatus(code: string, status: OrderStatus): Promise<boolean>;
  /** Ajustes que el panel guarda de sí mismo, como la contraseña. */
  leerAjuste(clave: string): Promise<string | null>;
  /** Devuelve false cuando no hay dónde escribir; el panel lo dice en pantalla. */
  guardarAjuste(clave: string, valor: string): Promise<boolean>;
}

/* ──────────────────────────────── Redis ──────────────────────────────── */

interface RedisConfig {
  url: string;
  token: string;
}

function redisConfig(): RedisConfig | null {
  // Nombres que inyecta la integración de Upstash en Vercel.
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

async function redisCommand<T>(config: RedisConfig, command: (string | number)[]): Promise<T> {
  const respuesta = await fetch(config.url, {
    method: "POST",
    headers: { authorization: `Bearer ${config.token}`, "content-type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!respuesta.ok) {
    throw new Error(`Redis respondió ${respuesta.status}`);
  }

  const datos = (await respuesta.json()) as { result: T };
  return datos.result;
}

/** Clave de la lista donde se acumula cada colección. */
export const REDIS_KEYS = { orders: "lecoin:pedidos", leads: "lecoin:solicitudes" } as const;

/** Los ajustes son claves sueltas, no listas. */
const claveAjuste = (clave: string) => "lecoin:ajustes:" + clave;

export async function redisPush(coleccion: keyof typeof REDIS_KEYS, valor: unknown): Promise<void> {
  const config = redisConfig();
  if (!config) throw new Error("Redis no está configurado");
  // LPUSH deja lo más reciente primero, que es como se mira un panel.
  await redisCommand(config, ["LPUSH", REDIS_KEYS[coleccion], JSON.stringify(valor)]);
}

async function redisList<T>(coleccion: keyof typeof REDIS_KEYS, config: RedisConfig): Promise<T[]> {
  const crudo = await redisCommand<string[]>(config, ["LRANGE", REDIS_KEYS[coleccion], 0, 499]);
  return crudo.map((linea) => JSON.parse(linea) as T);
}

/* ──────────────────────────────── Archivo ──────────────────────────────── */

async function leerNdjson<T>(ruta: string): Promise<T[]> {
  const { readFile } = await import("node:fs/promises");

  try {
    const contenido = await readFile(ruta, "utf8");
    return contenido
      .split("\n")
      .filter((linea) => linea.trim())
      .map((linea) => JSON.parse(linea) as T)
      .reverse(); // Lo último escrito, primero en la pantalla.
  } catch {
    // Todavía no hay ningún registro: no es un error, es un buzón vacío.
    return [];
  }
}

async function rutaDe(coleccion: "orders" | "leads"): Promise<string> {
  const path = await import("node:path");
  const porDefecto = coleccion === "orders" ? "pedidos.ndjson" : "leads.ndjson";
  const configurada = coleccion === "orders" ? process.env.ORDERS_FILE : process.env.LEADS_FILE;
  return configurada ?? path.join(process.cwd(), ".data", porDefecto);
}

/* ─────────────────────────────── Selección ─────────────────────────────── */

export function getAdminRepository(): AdminRepository {
  const config = redisConfig();

  if (config) {
    return {
      backend: "redis",
      listOrders: () => redisList<StoredOrder>("orders", config),
      listLeads: () => redisList<StoredLead>("leads", config),

      async setOrderStatus(code, status) {
        const pedidos = await redisList<StoredOrder>("orders", config);
        const indice = pedidos.findIndex((pedido) => pedido.code === code);
        if (indice < 0) return false;

        // LSET sobre la misma posición: se corrige en su sitio, sin duplicar.
        await redisCommand(config, [
          "LSET",
          REDIS_KEYS.orders,
          indice,
          JSON.stringify({ ...pedidos[indice], status }),
        ]);
        return true;
      },

      async leerAjuste(clave) {
        return redisCommand<string | null>(config, ["GET", claveAjuste(clave)]);
      },

      async guardarAjuste(clave, valor) {
        await redisCommand(config, ["SET", claveAjuste(clave), valor]);
        return true;
      },
    };
  }

  const usaArchivo = (process.env.ORDERS_STORE ?? (process.env.VERCEL ? "" : "file")).includes(
    "file",
  );

  if (!usaArchivo) {
    return {
      backend: "ninguno",
      async listOrders() {
        return [];
      },
      async listLeads() {
        return [];
      },
      async setOrderStatus() {
        return false;
      },
      async leerAjuste() {
        return null;
      },
      async guardarAjuste() {
        return false;
      },
    };
  }

  return {
    backend: "archivo",
    async listOrders() {
      return leerNdjson<StoredOrder>(await rutaDe("orders"));
    },
    async listLeads() {
      return leerNdjson<StoredLead>(await rutaDe("leads"));
    },

    async setOrderStatus(code, status) {
      const { writeFile } = await import("node:fs/promises");
      const ruta = await rutaDe("orders");

      // Se reescribe entero: son decenas de pedidos, no millones, y así el
      // archivo nunca queda con dos versiones del mismo código.
      const pedidos = await leerNdjson<StoredOrder>(ruta);
      if (!pedidos.some((pedido) => pedido.code === code)) return false;

      const actualizados = pedidos
        .map((pedido) => (pedido.code === code ? { ...pedido, status } : pedido))
        .reverse();

      await writeFile(ruta, actualizados.map((p) => JSON.stringify(p)).join("\n") + "\n", "utf8");
      return true;
    },

    async leerAjuste(clave) {
      return (await leerAjustes())[clave] ?? null;
    },

    async guardarAjuste(clave, valor) {
      const { writeFile, mkdir } = await import("node:fs/promises");
      const path = await import("node:path");

      const ruta = await rutaAjustes();
      const ajustes = await leerAjustes();
      ajustes[clave] = valor;

      await mkdir(path.dirname(ruta), { recursive: true });
      await writeFile(ruta, JSON.stringify(ajustes, null, 2), "utf8");
      return true;
    },
  };
}

async function rutaAjustes(): Promise<string> {
  const path = await import("node:path");
  return path.join(process.cwd(), ".data", "ajustes.json");
}

async function leerAjustes(): Promise<Record<string, string>> {
  const { readFile } = await import("node:fs/promises");
  try {
    return JSON.parse(await readFile(await rutaAjustes(), "utf8")) as Record<string, string>;
  } catch {
    return {};
  }
}
