import type { z } from "zod";
import type { FormatSchema } from "../schema";

/**
 * Catálogo de formatos (SKU), tomado de los empaques reales:
 * 250 g retail (bolsa botánica) y 2.5 kg cafetería (bolsa negra con válvula).
 *
 * Agregar un formato nuevo es agregar un objeto: las tarjetas del portafolio,
 * las fichas de lote y el formulario de muestras se actualizan solos.
 * EDITAR: unidades por caja reales y código de barras por formato.
 */
export const formats: z.input<typeof FormatSchema>[] = [
  {
    id: "retail-250",
    grams: 250,
    line: "retail",
    valve: false,
    description: {
      es: "Formato de góndola y consumo hogareño. 100% café arábico, en grano o molido.",
      en: "Shelf and home format. 100% arabica coffee, whole bean or ground.",
    },
    tags: [
      { es: "Retail", en: "Retail" },
      { es: "Grano / molido", en: "Whole bean / ground" },
      { es: "Café de Colombia", en: "Café de Colombia" },
    ],
    image: {
      src: "/img/producto-250g.webp",
      alt: {
        es: "Bolsa de 250 g de café Le Coin, 100% café arábico de finca colombiana",
        en: "250 g bag of Le Coin coffee, 100% arabica from a Colombian farm",
      },
    },
  },
  {
    id: "horeca-2500",
    grams: 2500,
    line: "horeca",
    valve: true,
    description: {
      es: "Formato cafetería con válvula desgasificadora: alto volumen para barras de especialidad, hoteles y restaurantes.",
      en: "Coffee-shop format with degassing valve: high volume for specialty bars, hotels and restaurants.",
    },
    tags: [
      { es: "HoReCa", en: "HoReCa" },
      { es: "Café & Bistro", en: "Café & Bistro" },
      { es: "100% colombiano", en: "100% Colombian" },
    ],
    image: {
      src: "/img/producto-2500g.webp",
      alt: {
        es: "Bolsas de 2.5 kg de café Le Coin con válvula desgasificadora, línea Café & Bistro",
        en: "2.5 kg Le Coin coffee bags with degassing valve, Café & Bistro line",
      },
    },
  },
];
