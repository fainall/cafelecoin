import type { z } from "zod";
import type { EstateSchema } from "../schema";

/**
 * Datos de la finca y el relato de marca.
 * EDITAR: altitud real de la finca y la ruta de la foto en /public/img.
 */
export const estate: z.input<typeof EstateSchema> = {
  city: "Manizales",
  department: "Caldas",
  country: "Colombia",
  countryCode: "CO",
  altitudeMasl: 1850,
  tagline: {
    es: "La esencia de Manizales en un solo rincón.",
    en: "The essence of Manizales in a single corner.",
  },
  subTagline: {
    es: "Single Estate Coffee — de nuestra finca a tu taza.",
    en: "Single Estate Coffee — from our farm to your cup.",
  },
  claim: {
    es: "Café Le Coin, más que un café, una experiencia.",
    en: "Café Le Coin: more than a coffee, an experience.",
  },
  story: {
    es: [
      "Café Le Coin cuenta con sus propios cultivos de café en la ciudad de Manizales, Colombia, país reconocido por entregar la mejor calidad de café.",
      "Nuestros procesos son totalmente artesanales: la recolección de cada uno de nuestros granos de café es a mano, nuestro abono es mediante la lumbricultura, el riego proviene de un manantial natural que nace en nuestras tierras y el secado es por la luz del sol.",
      "Estos procesos resaltan la característica de un buen café —aroma, cuerpo y sabor— que solo podrás encontrar al interior de esta bolsa.",
    ],
    en: [
      "Café Le Coin grows its own coffee in the city of Manizales, Colombia, a country recognised for delivering the finest coffee quality.",
      "Our processes are entirely artisanal: every bean is hand-picked, our fertiliser comes from vermiculture, irrigation flows from a natural spring born on our own land, and drying is done under the sun.",
      "These processes bring out what defines a great coffee —aroma, body and flavour— and you will only find them inside this bag.",
    ],
  },
  image: {
    src: "/img/finca.webp",
    alt: {
      es: "Cafetales en las laderas de Manizales al amanecer, con la bruma entre las montañas",
      en: "Coffee fields on the slopes of Manizales at dawn, with mist between the ridges",
    },
    // El sol y la bruma quedan en la franja central incluso en pantallas anchas.
    focus: "center 38%",
  },
  processSteps: [
    {
      id: "siembra",
      title: { es: "Siembra", en: "Planting" },
      body: {
        es: "Cultivo propio en las laderas de Manizales, a plena altitud cafetera.",
        en: "Our own crop on the slopes of Manizales, at full coffee-growing altitude.",
      },
    },
    {
      id: "cosecha",
      title: { es: "Cosecha selectiva", en: "Selective harvest" },
      body: {
        es: "Recolección a mano, grano por grano, únicamente en punto óptimo de madurez.",
        en: "Hand-picked bean by bean, only at optimal ripeness.",
      },
    },
    {
      id: "lumbricultura",
      title: { es: "Lumbricultura", en: "Vermiculture" },
      body: {
        es: "Abono orgánico producido en la finca: suelo vivo, taza limpia.",
        en: "Organic fertiliser produced on the farm: living soil, clean cup.",
      },
    },
    {
      id: "manantial",
      title: { es: "Agua de manantial", en: "Spring water" },
      body: {
        es: "El riego nace en nuestras propias tierras, sin intermediarios.",
        en: "Irrigation is born on our own land, with no intermediaries.",
      },
    },
    {
      id: "secado",
      title: { es: "Secado al sol", en: "Sun drying" },
      body: {
        es: "Secado controlado en origen para fijar aroma, cuerpo y dulzor.",
        en: "Controlled drying at origin to lock in aroma, body and sweetness.",
      },
    },
    {
      id: "tostion",
      title: { es: "Tostión de precisión", en: "Precision roasting" },
      body: {
        es: "Realizada por nuestro socio estratégico Tisquesusa, con tecnología de punta para el desarrollo del grano.",
        en: "Carried out by our strategic partner Tisquesusa, with state-of-the-art technology for bean development.",
      },
      partner: "Tisquesusa",
    },
  ],
};
