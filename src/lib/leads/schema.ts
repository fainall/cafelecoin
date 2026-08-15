import { z } from "zod";

import { locales } from "@/i18n/config";

/** Los campos opcionales de un formulario llegan como "" cuando no se llenan. */
const emptyToUndefined = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    schema,
  );

export const leadCountries = ["CL", "AR", "CO", "OTHER"] as const;
export const leadChannels = ["cafe", "hotel", "distributor", "retail", "other"] as const;

export type LeadCountry = (typeof leadCountries)[number];
export type LeadChannel = (typeof leadChannels)[number];

/**
 * Contrato público de una solicitud de muestras.
 * Lo usan por igual el formulario del sitio y el endpoint POST /api/leads,
 * de modo que cualquier otro cliente (landing, campaña, app) puede integrarse.
 */
export const LeadInputSchema = z.object({
  name: z.string().trim().min(2, "Nombre demasiado corto").max(120),
  company: z.string().trim().min(2, "Empresa demasiado corta").max(160),
  email: z.email("Correo inválido").max(180),
  phone: emptyToUndefined(z.string().trim().min(6).max(32).optional()),
  country: z.enum(leadCountries),
  channel: z.enum(leadChannels),
  monthlyVolumeKg: emptyToUndefined(z.coerce.number().int().positive().max(100_000).optional()),
  formatIds: z.array(z.string().min(1)).max(20).default([]),
  lotSlug: emptyToUndefined(z.string().min(1).max(120).optional()),
  message: emptyToUndefined(z.string().trim().max(2000).optional()),
  consent: z.literal(true, "Se requiere la autorización de contacto"),
  locale: z.enum(locales).default("es"),
  /**
   * Trampa anti-spam: los bots la completan, las personas no la ven.
   * Se acepta con valor para poder descartar la solicitud en silencio.
   */
  website: emptyToUndefined(z.string().max(200).optional()),
});

export type LeadInput = z.output<typeof LeadInputSchema>;

export interface StoredLead extends Omit<LeadInput, "website"> {
  id: string;
  receivedAt: string;
  userAgent?: string;
  referer?: string;
}

/** Aplana los errores de Zod en un mapa campo → mensaje para el formulario. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    errors[key] ??= issue.message;
  }
  return errors;
}
