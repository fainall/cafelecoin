import { describe, expect, it } from "vitest";

import type { Format } from "@/content/schema";
import { summarize } from "@/lib/cart/cart";
import { OrderInputSchema, orderCode } from "./schema";

const formato = (id: string, grams: number, amount: number): Format => ({
  id,
  grams,
  line: "retail",
  valve: false,
  description: { es: "", en: "" },
  tags: [],
  retailPrice: { amount, currency: "CLP" },
  wholesaleTiers: [],
  stock: "disponible",
});

const catalogo = [formato("retail-250", 250, 11000), formato("horeca-2500", 2500, 86000)];

const comprador = {
  name: "Camila Rojas",
  email: "camila@example.cl",
  phone: "+56 9 1234 5678",
  country: "CL",
  region: "Metropolitana",
  city: "Providencia",
  address: "Av. Siempre Viva 742",
};

describe("contrato del pedido", () => {
  it("acepta un pedido completo", () => {
    const resultado = OrderInputSchema.safeParse({
      ...comprador,
      lines: [{ formatId: "retail-250", quantity: 2 }],
    });

    expect(resultado.success).toBe(true);
  });

  it("rechaza un pedido sin productos", () => {
    const resultado = OrderInputSchema.safeParse({ ...comprador, lines: [] });
    expect(resultado.success).toBe(false);
  });

  it("rechaza una dirección demasiado corta", () => {
    const resultado = OrderInputSchema.safeParse({
      ...comprador,
      address: "s/n",
      lines: [{ formatId: "retail-250", quantity: 1 }],
    });

    expect(resultado.success).toBe(false);
  });

  it("no deja que el navegador mande precios: el esquema los ignora", () => {
    const resultado = OrderInputSchema.parse({
      ...comprador,
      lines: [{ formatId: "retail-250", quantity: 1, unitPrice: 1 }],
    });

    expect(resultado.lines[0]).toEqual({ formatId: "retail-250", quantity: 1 });
  });
});

describe("valoración en el servidor", () => {
  it("calcula el total desde el catálogo, no desde el cliente", () => {
    const resumen = summarize(
      [
        { formatId: "retail-250", quantity: 3 },
        { formatId: "horeca-2500", quantity: 1 },
      ],
      catalogo,
    );

    expect(resumen.total).toEqual({ amount: 3 * 11000 + 86000, currency: "CLP" });
    expect(resumen.weightGrams).toBe(3 * 250 + 2500);
  });

  it("descarta formatos que ya no existen en el catálogo", () => {
    const resumen = summarize(
      [
        { formatId: "retail-250", quantity: 1 },
        { formatId: "inventado", quantity: 99 },
      ],
      catalogo,
    );

    expect(resumen.lines).toHaveLength(1);
    expect(resumen.total.amount).toBe(11000);
  });

  it("deja fuera del total lo que está agotado", () => {
    const agotado = { ...formato("retail-250", 250, 11000), stock: "agotado" as const };
    const resumen = summarize([{ formatId: "retail-250", quantity: 2 }], [agotado]);

    expect(resumen.total.amount).toBe(0);
    expect(resumen.unavailable).toHaveLength(1);
  });
});

describe("código de pedido", () => {
  it("se puede dictar por teléfono sin ambigüedad", () => {
    const codigo = orderCode();

    expect(codigo).toMatch(/^LC-[23456789BCDFGHJKLMNPQRSTVWXYZ]{6}$/);
    // Nada de 0/O ni 1/I, que se confunden al leerlos en voz alta.
    expect(codigo).not.toMatch(/[01OIAEU]/);
  });

  it("no repite códigos", () => {
    const codigos = new Set(Array.from({ length: 200 }, () => orderCode()));
    expect(codigos.size).toBe(200);
  });
});
