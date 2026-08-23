import type { z } from "zod";
import type { LotSchema } from "../schema";

/**
 * Lotes de café. Cada lote genera su propia página (/es/cafe/[slug]),
 * su ficha técnica, su perfil sensorial y su JSON-LD de producto.
 *
 * EDITAR antes de publicar: variedades, altitud, ventana de cosecha,
 * valores sensoriales y puntaje SCA de cada lote (según catación real).
 * Los lotes con status "draft" no se publican (ver CONTENT_INCLUDE_DRAFTS).
 */
export const lots: z.input<typeof LotSchema>[] = [
  {
    slug: "manizales-lavado",
    name: "Le Coin · Manizales Lavado",
    status: "published",
    species: { es: "100% Arábica", en: "100% Arabica" },
    varieties: ["Castillo", "Caturra", "Colombia"],
    altitudeMasl: 1850,
    process: "lavado",
    processLabel: { es: "Lavado", en: "Washed" },
    harvestWindow: {
      es: "Cosecha principal: octubre – diciembre",
      en: "Main harvest: October – December",
    },
    roaster: "Tisquesusa",
    summary: {
      es: "Nuestro lote insignia: dulzor de panela, cuerpo achocolatado y un cierre cítrico limpio, propio de nuestra altura.",
      en: "Our flagship lot: panela sweetness, chocolatey body and a clean citric finish typical of our altitude.",
    },
    sensory: {
      scaScore: 82,
      summary: {
        es: "Taza redonda y reconocible, estable en espresso y en métodos de filtrado.",
        en: "A round, recognisable cup, stable in espresso and filter methods.",
      },
      notes: [
        { es: "Chocolate", en: "Chocolate" },
        { es: "Panela", en: "Panela" },
        { es: "Frutos cítricos", en: "Citrus fruit" },
        { es: "Caramelo", en: "Caramel" },
        { es: "Final limpio", en: "Clean finish" },
      ],
      attributes: [
        { id: "aroma", label: { es: "Aroma", en: "Aroma" }, value: 9 },
        { id: "acidez", label: { es: "Acidez", en: "Acidity" }, value: 8 },
        { id: "cuerpo", label: { es: "Cuerpo", en: "Body" }, value: 7 },
        { id: "dulzor", label: { es: "Dulzor", en: "Sweetness" }, value: 8 },
        {
          id: "tueste",
          label: { es: "Tueste", en: "Roast" },
          value: 5,
          display: { es: "Medio", en: "Medium" },
        },
      ],
    },
    formatIds: ["retail-250", "retail-500", "horeca-1000", "horeca-2500"],
  },
  {
    // Ejemplo de lote en preparación: demuestra el flujo editorial sin publicarse.
    slug: "manizales-honey",
    name: "Le Coin · Manizales Honey",
    status: "draft",
    species: { es: "100% Arábica", en: "100% Arabica" },
    varieties: ["Caturra"],
    altitudeMasl: 1850,
    process: "honey",
    processLabel: { es: "Honey", en: "Honey" },
    harvestWindow: {
      es: "Microlote de traviesa: abril – junio",
      en: "Fly-crop microlot: April – June",
    },
    roaster: "Tisquesusa",
    summary: {
      es: "Microlote experimental con mayor dulzor y cuerpo sedoso.",
      en: "Experimental microlot with higher sweetness and a silky body.",
    },
    sensory: {
      summary: {
        es: "En proceso de catación. Ficha sujeta a confirmación.",
        en: "Cupping in progress. Sheet subject to confirmation.",
      },
      notes: [
        { es: "Panela", en: "Panela" },
        { es: "Frutos rojos", en: "Red fruit" },
      ],
      attributes: [
        { id: "aroma", label: { es: "Aroma", en: "Aroma" }, value: 9 },
        { id: "acidez", label: { es: "Acidez", en: "Acidity" }, value: 7 },
        { id: "cuerpo", label: { es: "Cuerpo", en: "Body" }, value: 8 },
        { id: "dulzor", label: { es: "Dulzor", en: "Sweetness" }, value: 9 },
        {
          id: "tueste",
          label: { es: "Tueste", en: "Roast" },
          value: 4,
          display: { es: "Medio-claro", en: "Medium-light" },
        },
      ],
    },
    formatIds: ["retail-250"],
  },
];
