import type { z } from "zod";
import type { ContactSchema } from "../schema";

/**
 * Datos de contacto de la marca.
 * El correo y el dominio salen de la etiqueta trasera del empaque.
 * EDITAR: usuario real de Instagram (el del empaque no es legible).
 */
export const contact: z.input<typeof ContactSchema> = {
  brand: "Le Coin",
  legalName: "Café Le Coin",
  email: "info@lecoin.cl",
  instagram: "cafelecoin",
  siteUrl: "https://www.lecoin.cl",
  primaryPhoneId: "co",
  phones: [
    {
      id: "co",
      e164: "573215261575",
      display: "+57 321 526 1575",
      region: { es: "Colombia", en: "Colombia" },
      whatsapp: true,
    },
    {
      id: "cl",
      e164: "56982668656",
      display: "+56 9 8266 8656",
      region: { es: "Chile", en: "Chile" },
      whatsapp: true,
    },
    {
      id: "ar",
      e164: "5493875729511",
      display: "+54 9 387 572 9511",
      region: { es: "Argentina", en: "Argentina" },
      whatsapp: true,
    },
  ],
};
