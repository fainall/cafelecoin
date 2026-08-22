import type { z } from "zod";
import type { ProductLineInfoSchema } from "../schema";

/**
 * Las dos líneas de café, tal como están impresas en los empaques.
 *
 * No son dos tamaños del mismo producto: cambian la etiqueta, el público y el
 * argumento de venta. De aquí sale cómo se presenta cada una en el sitio.
 * EDITAR: confirmar el perfil de tueste de cada línea con Tisquesusa.
 */
export const productLines: z.input<typeof ProductLineInfoSchema>[] = [
  {
    id: "retail",
    name: "100% Café Arábico",
    tagline: { es: "Finca Colombiana", en: "Colombian Estate" },
    audience: { es: "Para tu casa", en: "For your home" },
    description: {
      es: "Nuestro café de finca en formato de 250 g, con la etiqueta botánica. Molido a pedido o en grano, para quien prepara su café en casa.",
      en: "Our estate coffee in a 250 g bag with the botanical label. Ground to order or whole bean, for brewing at home.",
    },
    traits: [
      { es: "Bolsa de 250 g", en: "250 g bag" },
      { es: "Grano entero o molido", en: "Whole bean or ground" },
      { es: "Sello Café de Colombia", en: "Café de Colombia seal" },
    ],
  },
  {
    id: "horeca",
    name: "Café & Bistro",
    tagline: { es: "100% Colombian Coffee", en: "100% Colombian Coffee" },
    audience: { es: "Para tu cafetería", en: "For your coffee shop" },
    description: {
      es: "La línea de barra: formato de 2,5 kg con válvula desgasificadora, pensado para operaciones que muelen todos los días y necesitan una taza estable.",
      en: "The bar line: 2.5 kg format with a degassing valve, made for operations that grind daily and need a consistent cup.",
    },
    traits: [
      { es: "Bolsa de 2,5 kg", en: "2.5 kg bag" },
      { es: "Válvula desgasificadora", en: "Degassing valve" },
      { es: "Precio por volumen", en: "Volume pricing" },
    ],
    requestQuote: true,
  },
];
