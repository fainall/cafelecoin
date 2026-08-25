import { z } from "zod";

import { locales } from "@/i18n/config";
import type { Money } from "@/content/schema";

/** Los campos opcionales de un formulario llegan como "" cuando no se llenan. */
const emptyToUndefined = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    schema,
  );

export const orderCountries = ["CL", "AR", "CO"] as const;
export type OrderCountry = (typeof orderCountries)[number];

/**
 * Contrato público de un pedido.
 *
 * El cliente manda QUÉ quiere y A DÓNDE, nunca cuánto cuesta: los precios se
 * recalculan en el servidor desde el catálogo. Un carrito manipulado en el
 * navegador no puede cambiar el total.
 */
export const OrderLineSchema = z.object({
  formatId: z.string().min(1),
  quantity: z.number().int().positive().max(999),
});

export const OrderInputSchema = z.object({
  lines: z.array(OrderLineSchema).min(1, "El pedido no tiene productos").max(50),

  name: z.string().trim().min(2, "Nombre demasiado corto").max(120),
  email: z.email("Correo inválido").max(180),
  phone: z.string().trim().min(6, "Teléfono demasiado corto").max(32),

  country: z.enum(orderCountries),
  region: z.string().trim().min(2, "Indica la región").max(120),
  city: z.string().trim().min(2, "Indica la comuna o ciudad").max(120),
  address: z.string().trim().min(5, "Dirección demasiado corta").max(240),
  notes: emptyToUndefined(z.string().trim().max(600).optional()),

  locale: z.enum(locales).default("es"),

  /** Trampa anti-spam: los bots la completan, las personas no la ven. */
  website: emptyToUndefined(z.string().max(200).optional()),
});

export type OrderInput = z.output<typeof OrderInputSchema>;

/** Una línea ya valorada por el servidor. */
export interface OrderItem {
  formatId: string;
  /** Etiqueta legible del formato, p. ej. "250 g". */
  label: string;
  quantity: number;
  unit: Money;
  subtotal: Money;
}

/** Vida de un pedido, en el orden en que ocurre. */
export const orderStatuses = [
  "pendiente",
  "pagado",
  "despachado",
  "entregado",
  "cancelado",
] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export interface StoredOrder extends Omit<OrderInput, "website" | "lines"> {
  /** Código legible que el comprador puede citar: LC-XXXXXX. */
  code: string;
  items: OrderItem[];
  total: Money;
  weightGrams: number;
  status: OrderStatus;
  /** Cómo se cobra: el proveedor de pago que atendió el pedido. */
  payment: string;
  placedAt: string;
  userAgent?: string;
}

/**
 * Código de pedido corto y legible por teléfono: sin vocales ni caracteres que
 * se confundan al dictarlos (0/O, 1/I).
 */
const ALFABETO = "23456789BCDFGHJKLMNPQRSTVWXYZ";

export function orderCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let codigo = "";
  for (const byte of bytes) codigo += ALFABETO[byte % ALFABETO.length];
  return `LC-${codigo}`;
}

/** Aplana los errores de Zod en un mapa campo → mensaje para el formulario. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    errors[key] ??= issue.message;
  }
  return errors;
}
