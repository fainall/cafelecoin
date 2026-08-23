import type { z } from "zod";
import type { FormatSchema } from "../schema";

/**
 * Catálogo de formatos (SKU): cuatro pesos en dos líneas, como los vende
 * Fernando. 250 g y 500 g para hogar; 1 kg y 2.5 kg para barra.
 *
 * Los precios son los de su lista y ya llevan el despacho dentro, así que el
 * carrito no suma envío al final.
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
    retailPrice: { amount: 11000, currency: "CLP" },
    wholesaleTiers: [
      { minQuantity: 12, unit: { amount: 9500, currency: "CLP" } },
      { minQuantity: 48, unit: { amount: 8700, currency: "CLP" } },
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
    id: "retail-500",
    grams: 500,
    line: "retail",
    valve: false,
    description: {
      es: "Medio kilo para consumo hogareño frecuente. 100% café arábico, en grano o molido.",
      en: "Half a kilo for regular home use. 100% arabica coffee, whole bean or ground.",
    },
    tags: [
      { es: "Retail", en: "Retail" },
      { es: "Grano / molido", en: "Whole bean / ground" },
      { es: "Café de Colombia", en: "Café de Colombia" },
    ],
    retailPrice: { amount: 20000, currency: "CLP" },
    wholesaleTiers: [
      { minQuantity: 12, unit: { amount: 17500, currency: "CLP" } },
      { minQuantity: 48, unit: { amount: 16000, currency: "CLP" } },
    ],
    // FALTA: fotografía del empaque de 500 g. Sin ella la tarjeta cae al
    // marcador de respaldo, que se ve pobre al lado de las otras.
  },
  {
    id: "horeca-1000",
    grams: 1000,
    line: "horeca",
    // Del brief del cliente: los formatos de barra llevan válvula. En la foto
    // solo pude confirmarla en el de 2.5 kg.
    valve: true,
    description: {
      es: "Un kilo para barras de volumen moderado, hoteles pequeños y cartas de temporada.",
      en: "One kilo for moderate-volume bars, small hotels and seasonal menus.",
    },
    tags: [
      { es: "HoReCa", en: "HoReCa" },
      { es: "Café & Bistro", en: "Café & Bistro" },
      { es: "100% colombiano", en: "100% Colombian" },
    ],
    retailPrice: { amount: 36000, currency: "CLP" },
    wholesaleTiers: [
      { minQuantity: 6, unit: { amount: 33500, currency: "CLP" } },
      { minQuantity: 15, unit: { amount: 31000, currency: "CLP" } },
    ],
    // FALTA: fotografía del empaque de 1 kg.
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
    retailPrice: { amount: 86000, currency: "CLP" },
    wholesaleTiers: [
      { minQuantity: 4, unit: { amount: 79500, currency: "CLP" } },
      { minQuantity: 10, unit: { amount: 74000, currency: "CLP" } },
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
