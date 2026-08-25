import type { z } from "zod";
import type { ContactSchema } from "../schema";

/**
 * Datos de contacto de la marca.
 * El correo y el dominio salen de la etiqueta trasera del empaque.
 *
 * El teléfono principal es el chileno: es el mercado donde se vende, y es el
 * número que atiende los pedidos de la tienda.
 */
export const contact: z.input<typeof ContactSchema> = {
  brand: "Le Coin",
  legalName: "Café Le Coin",
  email: "info@lecoin.cl",
  instagram: "cafelecoin.tienda",
  siteUrl: "https://www.lecoin.cl",
  primaryPhoneId: "cl",
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
