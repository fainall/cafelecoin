import type { Format, Money, PriceTier } from "@/content/schema";

/**
 * Lógica del carrito, sin interfaz ni almacenamiento.
 *
 * Son funciones puras sobre estructuras simples: se pueden probar sin navegador
 * y se pueden reutilizar igual desde la tienda, desde el portal mayorista o
 * desde el servidor al confirmar un pedido. El precio NUNCA viaja desde el
 * cliente: se recalcula aquí a partir del catálogo.
 */

/** Modo de venta: define qué lista de precios se aplica. */
export type SalesMode = "retail" | "wholesale";

/** Lo único que se guarda del carrito: qué y cuánto. */
export interface CartLine {
  formatId: string;
  quantity: number;
}

export interface PricedLine {
  format: Format;
  quantity: number;
  /** Precio unitario efectivo tras aplicar el escalón que corresponda. */
  unit: Money;
  subtotal: Money;
  /** Escalón aplicado, si el modo es mayorista y la cantidad lo alcanzó. */
  tier?: PriceTier;
}

export interface CartSummary {
  lines: PricedLine[];
  total: Money;
  /** Peso total en gramos: base para calcular el envío. */
  weightGrams: number;
  /** Formatos pedidos que ya no se pueden vender. */
  unavailable: Format[];
}

export class CartError extends Error {
  constructor(message: string) {
    super(`[cart] ${message}`);
    this.name = "CartError";
  }
}

const MAX_QUANTITY = 999;

/* ───────────────────────────── Operaciones ───────────────────────────── */

export function addLine(lines: CartLine[], formatId: string, quantity = 1): CartLine[] {
  if (quantity <= 0) return lines;

  const existing = lines.find((line) => line.formatId === formatId);
  if (!existing) {
    return [...lines, { formatId, quantity: Math.min(quantity, MAX_QUANTITY) }];
  }

  return lines.map((line) =>
    line.formatId === formatId
      ? { ...line, quantity: Math.min(line.quantity + quantity, MAX_QUANTITY) }
      : line,
  );
}

/** Fijar una cantidad en cero o menos equivale a quitar la línea. */
export function setQuantity(lines: CartLine[], formatId: string, quantity: number): CartLine[] {
  if (quantity <= 0) return removeLine(lines, formatId);

  return lines.map((line) =>
    line.formatId === formatId ? { ...line, quantity: Math.min(quantity, MAX_QUANTITY) } : line,
  );
}

export function removeLine(lines: CartLine[], formatId: string): CartLine[] {
  return lines.filter((line) => line.formatId !== formatId);
}

export function countUnits(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

/* ─────────────────────────────── Precios ─────────────────────────────── */

/**
 * Escalón aplicable: el de mayor `minQuantity` que la cantidad alcance.
 * Sin escalones alcanzados, el precio es el de lista.
 */
export function resolveTier(format: Format, quantity: number): PriceTier | undefined {
  return format.wholesaleTiers
    .filter((tier) => quantity >= tier.minQuantity)
    .sort((a, b) => b.minQuantity - a.minQuantity)[0];
}

export function unitPrice(format: Format, quantity: number, mode: SalesMode): Money {
  if (mode === "wholesale") {
    const tier = resolveTier(format, quantity);
    if (tier) return tier.unit;
  }

  if (!format.retailPrice) {
    throw new CartError(`El formato "${format.id}" no tiene precio de lista.`);
  }
  return format.retailPrice;
}

/**
 * Convierte las líneas guardadas en un resumen con precios vigentes.
 * Los formatos agotados no suman al total: se devuelven aparte para avisarlo.
 */
export function summarize(
  lines: CartLine[],
  catalogue: Format[],
  mode: SalesMode = "retail",
): CartSummary {
  const byId = new Map(catalogue.map((format) => [format.id, format]));

  const priced: PricedLine[] = [];
  const unavailable: Format[] = [];
  let currency: Money["currency"] | undefined;
  let total = 0;
  let weightGrams = 0;

  for (const line of lines) {
    const format = byId.get(line.formatId);
    // Una línea que ya no existe en el catálogo simplemente se ignora.
    if (!format) continue;

    if (format.stock === "agotado") {
      unavailable.push(format);
      continue;
    }

    const unit = unitPrice(format, line.quantity, mode);

    currency ??= unit.currency;
    if (unit.currency !== currency) {
      throw new CartError("El carrito no puede mezclar monedas.");
    }

    const subtotal = unit.amount * line.quantity;
    total += subtotal;
    weightGrams += format.grams * line.quantity;

    priced.push({
      format,
      quantity: line.quantity,
      unit,
      subtotal: { amount: subtotal, currency: unit.currency },
      tier: mode === "wholesale" ? resolveTier(format, line.quantity) : undefined,
    });
  }

  return {
    lines: priced,
    total: { amount: total, currency: currency ?? "CLP" },
    weightGrams,
    unavailable,
  };
}
