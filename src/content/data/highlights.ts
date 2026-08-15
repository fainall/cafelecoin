import type { z } from "zod";
import type { HighlightSchema } from "../schema";

/** Los tres pilares que se muestran bajo el relato de marca. */
export const highlights: z.input<typeof HighlightSchema>[] = [
  {
    id: "origen",
    icon: "origin",
    title: { es: "Café de Manizales", en: "Coffee from Manizales" },
    body: {
      es: "Un solo origen, finca propia en el corazón del eje cafetero colombiano.",
      en: "A single origin, our own farm in the heart of Colombia's coffee belt.",
    },
  },
  {
    id: "seleccion",
    icon: "selection",
    title: { es: "Selección rigurosa", en: "Rigorous selection" },
    body: {
      es: "Recolección a mano, grano por grano, únicamente en punto óptimo de madurez.",
      en: "Hand-picked bean by bean, only at optimal ripeness.",
    },
  },
  {
    id: "empaque",
    icon: "packaging",
    title: { es: "Empaque con válvula", en: "Valve packaging" },
    body: {
      es: "Válvula desgasificadora en los formatos HoReCa: la taza llega como salió del tueste.",
      en: "Degassing valve on HoReCa formats: the cup arrives as it left the roaster.",
    },
  },
];
