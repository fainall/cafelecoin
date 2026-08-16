import { describe, expect, it } from "vitest";

import { content } from "@/content";
import type { Format } from "@/content/schema";
import { addLine, countUnits, removeLine, resolveTier, setQuantity, summarize } from "./cart";
import { formatMoney } from "./money";

const catalogo = await content.getFormats();
const retail = catalogo.find((f) => f.line === "retail") as Format;
const horeca = catalogo.find((f) => f.line === "horeca") as Format;

describe("operaciones del carrito", () => {
  it("agrega y acumula la misma línea", () => {
    let lineas = addLine([], retail.id);
    lineas = addLine(lineas, retail.id, 2);

    expect(lineas).toHaveLength(1);
    expect(lineas[0].quantity).toBe(3);
  });

  it("ignora cantidades no positivas al agregar", () => {
    expect(addLine([], retail.id, 0)).toEqual([]);
    expect(addLine([], retail.id, -5)).toEqual([]);
  });

  it("fijar cantidad en cero quita la línea", () => {
    const lineas = addLine([], retail.id, 4);
    expect(setQuantity(lineas, retail.id, 0)).toEqual([]);
  });

  it("quita una línea sin tocar las demás", () => {
    let lineas = addLine([], retail.id, 1);
    lineas = addLine(lineas, horeca.id, 2);

    const resultado = removeLine(lineas, retail.id);
    expect(resultado).toHaveLength(1);
    expect(resultado[0].formatId).toBe(horeca.id);
  });

  it("cuenta las unidades totales", () => {
    let lineas = addLine([], retail.id, 3);
    lineas = addLine(lineas, horeca.id, 2);
    expect(countUnits(lineas)).toBe(5);
  });
});

describe("precios por escalón", () => {
  it("sin escalón alcanzado usa el precio de lista", () => {
    const resumen = summarize([{ formatId: retail.id, quantity: 2 }], catalogo, "wholesale");
    expect(resumen.lines[0].unit).toEqual(retail.retailPrice);
    expect(resumen.lines[0].tier).toBeUndefined();
  });

  it("aplica el escalón de mayor minQuantity alcanzado", () => {
    const mayor = [...retail.wholesaleTiers].sort((a, b) => b.minQuantity - a.minQuantity)[0];
    const tier = resolveTier(retail, mayor.minQuantity + 10);

    expect(tier?.minQuantity).toBe(mayor.minQuantity);
    expect(tier?.unit.amount).toBeLessThan(retail.retailPrice!.amount);
  });

  it("en modo retail ignora los escalones", () => {
    const cantidad = retail.wholesaleTiers[0].minQuantity + 5;
    const resumen = summarize([{ formatId: retail.id, quantity: cantidad }], catalogo, "retail");
    expect(resumen.lines[0].unit).toEqual(retail.retailPrice);
  });
});

describe("resumen del carrito", () => {
  it("calcula subtotales, total y peso", () => {
    const resumen = summarize(
      [
        { formatId: retail.id, quantity: 2 },
        { formatId: horeca.id, quantity: 1 },
      ],
      catalogo,
    );

    const esperado = retail.retailPrice!.amount * 2 + horeca.retailPrice!.amount;
    expect(resumen.total.amount).toBe(esperado);
    expect(resumen.weightGrams).toBe(retail.grams * 2 + horeca.grams);
    expect(resumen.lines[0].subtotal.amount).toBe(retail.retailPrice!.amount * 2);
  });

  it("ignora formatos que ya no están en el catálogo", () => {
    const resumen = summarize([{ formatId: "no-existe", quantity: 3 }], catalogo);
    expect(resumen.lines).toHaveLength(0);
    expect(resumen.total.amount).toBe(0);
  });

  it("aparta los agotados en vez de cobrarlos", () => {
    const agotado: Format = { ...retail, id: "agotado", stock: "agotado" };
    const resumen = summarize([{ formatId: "agotado", quantity: 2 }], [...catalogo, agotado]);

    expect(resumen.lines).toHaveLength(0);
    expect(resumen.unavailable.map((f) => f.id)).toEqual(["agotado"]);
    expect(resumen.total.amount).toBe(0);
  });

  it("rechaza mezclar monedas", () => {
    const enPesosColombianos: Format = {
      ...horeca,
      id: "otra-moneda",
      retailPrice: { amount: 50000, currency: "COP" },
    };

    expect(() =>
      summarize(
        [
          { formatId: retail.id, quantity: 1 },
          { formatId: "otra-moneda", quantity: 1 },
        ],
        [...catalogo, enPesosColombianos],
      ),
    ).toThrow(/moneda/i);
  });
});

describe("formato de importes", () => {
  it("el peso chileno se muestra sin decimales", () => {
    const texto = formatMoney({ amount: 10990, currency: "CLP" }, "es");
    expect(texto).toContain("10.990");
    expect(texto).not.toContain(",00");
  });
});
