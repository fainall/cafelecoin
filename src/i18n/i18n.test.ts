import { describe, expect, it } from "vitest";

import { dictionaries, getDictionary } from ".";
import { locales, negotiateLocale, translate } from "./config";

function keyPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("diccionarios", () => {
  it("todos los idiomas comparten exactamente las mismas claves", () => {
    const reference = keyPaths(dictionaries.es).sort();

    for (const locale of locales) {
      expect(keyPaths(dictionaries[locale]).sort(), `faltan claves en "${locale}"`).toEqual(
        reference,
      );
    }
  });

  it("no deja textos vacíos", () => {
    for (const locale of locales) {
      const flat = JSON.stringify(dictionaries[locale]);
      expect(flat).not.toContain('""');
    }
  });

  it("devuelve el diccionario por defecto ante un idioma desconocido", () => {
    // @ts-expect-error se prueba a propósito una entrada fuera del tipo
    expect(getDictionary("pt")).toBe(dictionaries.es);
  });
});

describe("negociación de idioma", () => {
  it("respeta la prioridad q del header", () => {
    expect(negotiateLocale("en-US,en;q=0.9,es;q=0.4")).toBe("en");
    expect(negotiateLocale("es-CL,es;q=0.9,en;q=0.3")).toBe("es");
  });

  it("cae al idioma por defecto sin coincidencias", () => {
    expect(negotiateLocale("fr-FR,de;q=0.8")).toBe("es");
    expect(negotiateLocale(null)).toBe("es");
  });
});

describe("translate", () => {
  it("resuelve el idioma pedido", () => {
    expect(translate({ es: "hola", en: "hello" }, "en")).toBe("hello");
  });
});
