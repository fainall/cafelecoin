import { describe, expect, it } from "vitest";

import { fieldErrors, LeadInputSchema } from "./schema";

const valid = {
  name: "Camila Rojas",
  company: "Cafetería Andina",
  email: "compras@andina.cl",
  country: "CL",
  channel: "cafe",
  consent: true,
  locale: "es",
};

describe("LeadInputSchema", () => {
  it("acepta una solicitud mínima válida", () => {
    const result = LeadInputSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.formatIds).toEqual([]);
    }
  });

  it("normaliza los opcionales vacíos del formulario a undefined", () => {
    const result = LeadInputSchema.safeParse({
      ...valid,
      phone: "",
      message: "   ",
      monthlyVolumeKg: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBeUndefined();
      expect(result.data.message).toBeUndefined();
      expect(result.data.monthlyVolumeKg).toBeUndefined();
    }
  });

  it("convierte el volumen de texto a número", () => {
    const result = LeadInputSchema.safeParse({ ...valid, monthlyVolumeKg: "120" });
    expect(result.success && result.data.monthlyVolumeKg).toBe(120);
  });

  it("rechaza correo inválido y falta de consentimiento", () => {
    const result = LeadInputSchema.safeParse({ ...valid, email: "no-es-correo", consent: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrors(result.error);
      expect(errors.email).toBeDefined();
      expect(errors.consent).toBeDefined();
    }
  });

  it("rechaza países fuera del catálogo", () => {
    expect(LeadInputSchema.safeParse({ ...valid, country: "MX" }).success).toBe(false);
  });

  it("conserva el honeypot para que el endpoint lo descarte", () => {
    const result = LeadInputSchema.safeParse({ ...valid, website: "" });
    expect(result.success && result.data.website).toBeUndefined();
  });
});
