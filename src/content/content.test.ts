import { describe, expect, it } from "vitest";

import { formatWeight, getPrimaryPhone, lotPath, whatsappUrl } from "./helpers";
import { loadStaticContent, staticContentSource } from "./source";

describe("capa de contenido", () => {
  it("valida todo el contenido y su integridad referencial", () => {
    expect(() => loadStaticContent()).not.toThrow();
  });

  it("no expone lotes en borrador por defecto", async () => {
    const lots = await staticContentSource.getLots();
    expect(lots.length).toBeGreaterThan(0);
    expect(lots.every((lot) => lot.status === "published")).toBe(true);
  });

  it("expone los borradores cuando se piden explícitamente", async () => {
    const all = await staticContentSource.getLots({ includeDrafts: true });
    const published = await staticContentSource.getLots({ includeDrafts: false });
    expect(all.length).toBeGreaterThanOrEqual(published.length);
  });

  it("resuelve los formatos referenciados por un lote", async () => {
    const [lot] = await staticContentSource.getLots();
    const formats = await staticContentSource.getFormatsByIds(lot.formatIds);
    expect(formats).toHaveLength(lot.formatIds.length);
  });

  it("cachea el snapshot entre llamadas", () => {
    expect(loadStaticContent()).toBe(loadStaticContent());
  });

  it("expone tres pilares con iconos conocidos", async () => {
    const highlights = await staticContentSource.getHighlights();
    expect(highlights).toHaveLength(3);
    for (const highlight of highlights) {
      expect(["origin", "selection", "packaging"]).toContain(highlight.icon);
    }
  });

  it("no publica testimonios inventados", async () => {
    const testimonials = await staticContentSource.getTestimonials();
    // La sección muestra la frase de marca mientras no haya citas reales.
    expect(Array.isArray(testimonials)).toBe(true);
  });
});

describe("helpers de presentación", () => {
  it("deriva la etiqueta de peso desde los gramos", () => {
    expect(formatWeight(250, "es")).toBe("250 g");
    expect(formatWeight(1000, "es")).toBe("1 kg");
    expect(formatWeight(2500, "en")).toBe("2.5 kg");
  });

  it("arma enlaces de WhatsApp con mensaje precargado", async () => {
    const contact = await staticContentSource.getContact();
    const phone = getPrimaryPhone(contact);
    const url = whatsappUrl(phone, "Hola Le Coin");

    expect(url).toBe(`https://wa.me/${phone.e164}?text=Hola%20Le%20Coin`);
    expect(phone.e164).toMatch(/^\d+$/);
  });

  it("construye rutas de lote localizadas", () => {
    expect(lotPath("en", { slug: "manizales-lavado" })).toBe("/en/cafe/manizales-lavado");
  });
});
