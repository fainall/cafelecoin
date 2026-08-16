import { z } from "zod";

import { contact as rawContact } from "./data/contact";
import { estate as rawEstate } from "./data/estate";
import { exportInfo as rawExportInfo } from "./data/export-info";
import { formats as rawFormats } from "./data/formats";
import { highlights as rawHighlights } from "./data/highlights";
import { lots as rawLots } from "./data/lots";
import { testimonials as rawTestimonials } from "./data/testimonials";
import {
  ContactSchema,
  EstateSchema,
  ExportInfoSchema,
  FormatSchema,
  HighlightSchema,
  LotSchema,
  TestimonialSchema,
  type Contact,
  type Estate,
  type ExportInfo,
  type Format,
  type Highlight,
  type Lot,
  type Testimonial,
} from "./schema";

export class ContentError extends Error {
  constructor(message: string) {
    super(`[content] ${message}`);
    this.name = "ContentError";
  }
}

/**
 * Contrato de la capa de contenido.
 *
 * La UI depende solo de esta interfaz. Cambiar los archivos locales por un CMS
 * headless implica escribir otra implementación de ContentSource y elegirla en
 * getContentSource(); ninguna página ni componente se modifica.
 */
export interface ContentSource {
  getEstate(): Promise<Estate>;
  getFormats(): Promise<Format[]>;
  getFormatsByIds(ids: readonly string[]): Promise<Format[]>;
  getLots(options?: { includeDrafts?: boolean }): Promise<Lot[]>;
  getLot(slug: string): Promise<Lot | null>;
  getExportInfo(): Promise<ExportInfo>;
  getContact(): Promise<Contact>;
  getHighlights(): Promise<Highlight[]>;
  getTestimonials(): Promise<Testimonial[]>;
}

function parse<S extends z.ZodType>(schema: S, value: unknown, label: string): z.output<S> {
  const result = schema.safeParse(value);
  if (!result.success) {
    const detail = result.error.issues
      .map((issue) => `  · ${issue.path.join(".") || "(raíz)"}: ${issue.message}`)
      .join("\n");
    throw new ContentError(`Datos inválidos en "${label}":\n${detail}`);
  }
  return result.data;
}

interface Snapshot {
  estate: Estate;
  formats: Format[];
  lots: Lot[];
  exportInfo: ExportInfo;
  contact: Contact;
  highlights: Highlight[];
  testimonials: Testimonial[];
}

let snapshot: Snapshot | null = null;

/** Valida todo el contenido una sola vez por proceso y verifica su integridad. */
export function loadStaticContent(): Snapshot {
  if (snapshot) return snapshot;

  const estate = parse(EstateSchema, rawEstate, "estate");
  const formats = parse(z.array(FormatSchema).min(1), rawFormats, "formats");
  const lots = parse(z.array(LotSchema).min(1), rawLots, "lots");
  const exportInfo = parse(ExportInfoSchema, rawExportInfo, "exportInfo");
  // El dominio se puede fijar por entorno: así el mismo código sirve para la
  // vista previa y para producción sin tocar el contenido. Se valida igual.
  const contact = parse(
    ContactSchema,
    { ...rawContact, siteUrl: process.env.NEXT_PUBLIC_SITE_URL || rawContact.siteUrl },
    "contact",
  );
  const highlights = parse(z.array(HighlightSchema).min(1), rawHighlights, "highlights");
  const testimonials = parse(z.array(TestimonialSchema), rawTestimonials, "testimonials");

  const formatIds = new Set(formats.map((format) => format.id));
  for (const lot of lots) {
    for (const id of lot.formatIds) {
      if (!formatIds.has(id)) {
        throw new ContentError(`El lote "${lot.slug}" referencia el formato inexistente "${id}".`);
      }
    }
  }

  const slugs = new Set<string>();
  for (const lot of lots) {
    if (slugs.has(lot.slug)) {
      throw new ContentError(`Slug de lote duplicado: "${lot.slug}".`);
    }
    slugs.add(lot.slug);
  }

  if (!contact.phones.some((phone) => phone.id === contact.primaryPhoneId)) {
    throw new ContentError(
      `primaryPhoneId "${contact.primaryPhoneId}" no coincide con ningún teléfono.`,
    );
  }

  snapshot = { estate, formats, lots, exportInfo, contact, highlights, testimonials };
  return snapshot;
}

/** Fuente de contenido respaldada por los archivos de src/content/data. */
export const staticContentSource: ContentSource = {
  async getEstate() {
    return loadStaticContent().estate;
  },
  async getFormats() {
    return loadStaticContent().formats;
  },
  async getFormatsByIds(ids) {
    const { formats } = loadStaticContent();
    const byId = new Map(formats.map((format) => [format.id, format]));
    return ids.flatMap((id) => {
      const format = byId.get(id);
      return format ? [format] : [];
    });
  },
  async getLots(options) {
    const includeDrafts = options?.includeDrafts ?? shouldIncludeDrafts();
    const { lots } = loadStaticContent();
    return includeDrafts ? lots : lots.filter((lot) => lot.status === "published");
  },
  async getLot(slug) {
    const lots = await staticContentSource.getLots();
    return lots.find((lot) => lot.slug === slug) ?? null;
  },
  async getExportInfo() {
    return loadStaticContent().exportInfo;
  },
  async getContact() {
    return loadStaticContent().contact;
  },
  async getHighlights() {
    return loadStaticContent().highlights;
  },
  async getTestimonials() {
    return loadStaticContent().testimonials;
  },
};

function shouldIncludeDrafts(): boolean {
  return process.env.CONTENT_INCLUDE_DRAFTS === "true";
}

/**
 * Selector de implementación. Hoy solo existe la fuente estática; cuando entre
 * un CMS, se agrega aquí sin tocar el resto de la aplicación.
 */
export function getContentSource(): ContentSource {
  switch (process.env.CONTENT_SOURCE) {
    case undefined:
    case "":
    case "static":
      return staticContentSource;
    default:
      throw new ContentError(`Fuente de contenido desconocida: "${process.env.CONTENT_SOURCE}".`);
  }
}

export const content = getContentSource();
