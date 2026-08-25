import type { z } from "zod";
import type { ExportInfoSchema } from "../schema";

/**
 * Argumentario B2B y cumplimiento normativo por mercado destino.
 * EDITAR: agregar certificaciones vigentes (Café de Colombia, comercio justo,
 * orgánico) a medida que se obtengan, y capacidad real de despacho.
 */
export const exportInfo: z.input<typeof ExportInfoSchema> = {
  intro: {
    es: "Trabajamos con cadenas de cafeterías, hoteles y distribuidores en Chile y Argentina que buscan granos con trazabilidad y frescura reales.",
    en: "We work with coffee shop chains, hotels and distributors in Chile and Argentina looking for genuine traceability and freshness.",
  },
  valueProps: [
    {
      id: "single-estate",
      title: { es: "Café Single Estate", en: "Single estate coffee" },
      body: {
        es: "Trazabilidad total: un solo origen, finca propia, desde la siembra hasta el secado.",
        en: "Full traceability: one origin, our own farm, from planting to drying.",
      },
    },
    {
      id: "horeca",
      title: { es: "Formatos HoReCa", en: "HoReCa formats" },
      body: {
        es: "Formato cafetería de 2.5 kg con válvula desgasificadora, además del retail de 250 g.",
        en: "2.5 kg coffee-shop format with degassing valve, alongside the 250 g retail bag.",
      },
    },
    {
      id: "perfil",
      title: { es: "Perfil de taza estable", en: "Consistent cup profile" },
      body: {
        es: "Chocolate, panela y cítricos; ideal para espresso y métodos de filtrado.",
        en: "Chocolate, panela and citrus; ideal for espresso and filter methods.",
      },
    },
    {
      id: "tostion",
      title: { es: "Tostión de precisión", en: "Precision roasting" },
      body: {
        es: "Alianza estratégica con Tisquesusa: tecnología de punta para el desarrollo del grano.",
        en: "Strategic partnership with Tisquesusa: state-of-the-art bean development.",
      },
    },
  ],
  /**
   * Cadena declarada en la etiqueta trasera del empaque.
   * EDITAR: confirmar razones sociales, NIT/RUT y registros antes de publicar
   * cifras legales; aquí solo van los nombres y las plazas.
   */
  supplyChain: [
    {
      id: "cultivo",
      role: { es: "Cultivo", en: "Growing" },
      name: "Café Le Coin",
      place: { es: "Finca propia · Manizales, Caldas", en: "Own farm · Manizales, Caldas" },
    },
    {
      id: "tostion",
      role: { es: "Tostión", en: "Roasting" },
      name: "Tostadora de Café Tisquesusa",
      place: { es: "Manizales, Caldas — Colombia", en: "Manizales, Caldas — Colombia" },
    },
    {
      id: "exportacion",
      role: { es: "Exportación", en: "Export" },
      name: "Comercializadora de la Loma S.A.S.",
      place: { es: "Colombia", en: "Colombia" },
    },
    {
      id: "importacion",
      role: { es: "Importación y distribución", en: "Import and distribution" },
      name: "Sociedad Comercial Le Coin Ltda.",
      place: { es: "Antofagasta — Chile", en: "Antofagasta — Chile" },
    },
  ],
  compliance: [
    {
      id: "ar",
      market: "AR",
      authority: "ANMAT / Mercosur",
      body: {
        es: "Etiquetado conforme a la normativa ANMAT y al Reglamento Técnico Mercosur.",
        en: "Labelling compliant with ANMAT regulations and the Mercosur technical framework.",
      },
    },
    {
      id: "cl",
      market: "CL",
      authority: "Minsal",
      body: {
        es: "Etiquetado conforme al Reglamento Sanitario de los Alimentos (Minsal).",
        en: "Labelling compliant with the Chilean Food Sanitary Regulation (Minsal).",
      },
    },
    {
      id: "co",
      market: "CO",
      authority: "Café de Colombia",
      body: {
        es: "Origen certificable bajo la denominación Café de Colombia.",
        en: "Certifiable origin under the Café de Colombia denomination.",
      },
    },
  ],
  logistics: [
    {
      es: "Capacidad de respuesta para pedidos recurrentes y programados.",
      en: "Response capacity for recurring and scheduled orders.",
    },
    {
      es: "Coordinación de envío y documentación de exportación.",
      en: "Shipping coordination and export documentation.",
    },
    {
      es: "Despacho a todo Chile con el envío incluido en el precio.",
      en: "Delivery anywhere in Chile with shipping included in the price.",
    },
  ],
};
