import { z } from "zod";

/**
 * Esquemas de la capa de contenido.
 *
 * Todo el contenido editorial del sitio se valida contra estos esquemas al
 * cargarse. Si mañana los datos vienen de un CMS (Sanity, Payload, Strapi) en
 * lugar de archivos locales, se valida con los mismos esquemas y ni la UI ni
 * las páginas cambian.
 */

/** Un campo traducido a todos los idiomas soportados. */
const localized = <T extends z.ZodType>(inner: T) =>
  z.object({
    es: inner,
    en: inner,
  });

export const LocalizedStringSchema = localized(z.string().min(1));
export const LocalizedTextSchema = localized(z.array(z.string().min(1)).min(1));

export const ImageSchema = z.object({
  /** Ruta pública (p. ej. /img/finca.jpg). Si el archivo no existe se usa la ilustración de respaldo. */
  src: z.string().min(1),
  alt: LocalizedStringSchema,
  /** Encuadre para object-position, p. ej. "center 60%". */
  focus: z.string().optional(),
});
export type Image = z.output<typeof ImageSchema>;

/* ───────────────────────────── Finca / origen ───────────────────────────── */

export const ProcessStepSchema = z.object({
  id: z.string().min(1),
  title: LocalizedStringSchema,
  body: LocalizedStringSchema,
  /** Marca el paso ejecutado por un socio estratégico (p. ej. la tostión). */
  partner: z.string().optional(),
});
export type ProcessStep = z.output<typeof ProcessStepSchema>;

export const EstateSchema = z.object({
  city: z.string().min(1),
  department: z.string().min(1),
  country: z.string().min(1),
  countryCode: z.string().length(2),
  altitudeMasl: z.number().int().min(0).max(3000),
  story: LocalizedTextSchema,
  claim: LocalizedStringSchema,
  tagline: LocalizedStringSchema,
  subTagline: LocalizedStringSchema,
  processSteps: z.array(ProcessStepSchema).min(1),
  image: ImageSchema.optional(),
});
export type Estate = z.output<typeof EstateSchema>;

/* ───────────────────────────── Formatos (SKU) ───────────────────────────── */

export const ProductLineSchema = z.enum(["retail", "horeca"]);
export type ProductLine = z.output<typeof ProductLineSchema>;

/* ─────────────────────────────── Precios ─────────────────────────────── */

export const CurrencySchema = z.enum(["CLP", "COP", "USD"]);
export type Currency = z.output<typeof CurrencySchema>;

/**
 * Importe en la unidad mínima que factura la moneda.
 * El peso chileno y el colombiano no usan decimales, así que `amount` es el
 * monto entero; nunca se guardan precios como número con coma.
 */
export const MoneySchema = z.object({
  amount: z.number().int().nonnegative(),
  currency: CurrencySchema,
});
export type Money = z.output<typeof MoneySchema>;

/** Escalón de precio mayorista: desde N unidades, cada una vale esto. */
export const PriceTierSchema = z.object({
  minQuantity: z.number().int().positive(),
  unit: MoneySchema,
});
export type PriceTier = z.output<typeof PriceTierSchema>;

export const StockSchema = z.enum(["disponible", "agotado", "bajo-pedido"]);
export type Stock = z.output<typeof StockSchema>;

export const FormatSchema = z.object({
  id: z.string().min(1),
  sku: z.string().min(1).optional(),
  /** Peso neto en gramos: única fuente de verdad, la etiqueta se deriva. */
  grams: z.number().int().positive(),
  line: ProductLineSchema,
  /** Válvula desgasificadora unidireccional. */
  valve: z.boolean(),
  description: LocalizedStringSchema,
  unitsPerCase: z.number().int().positive().optional(),
  tags: z.array(LocalizedStringSchema).default([]),
  /** Fotografía del empaque recortada sin fondo. */
  image: ImageSchema.optional(),

  /** Precio al público. Sin él, el formato no se puede comprar en línea. */
  retailPrice: MoneySchema.optional(),
  /**
   * Precio mayorista por escalones. Se aplica el escalón de mayor
   * `minQuantity` que la cantidad pedida alcance.
   */
  wholesaleTiers: z.array(PriceTierSchema).default([]),
  stock: StockSchema.default("disponible"),
});
export type Format = z.output<typeof FormatSchema>;

/* ──────────────────────────── Perfil sensorial ──────────────────────────── */

export const SensoryAttributeSchema = z.object({
  id: z.string().min(1),
  label: LocalizedStringSchema,
  /** Intensidad 0–10 usada por las barras del perfil. */
  value: z.number().min(0).max(10),
  /** Texto que reemplaza al número cuando aplica (p. ej. "Medio" para el tueste). */
  display: LocalizedStringSchema.optional(),
});
export type SensoryAttribute = z.output<typeof SensoryAttributeSchema>;

export const SensoryProfileSchema = z.object({
  /** Puntaje SCA. Se omite mientras no exista catación certificada. */
  scaScore: z.number().min(0).max(100).optional(),
  notes: z.array(LocalizedStringSchema).min(1),
  attributes: z.array(SensoryAttributeSchema).min(1),
  summary: LocalizedStringSchema,
});
export type SensoryProfile = z.output<typeof SensoryProfileSchema>;

/* ─────────────────────────────── Lotes ─────────────────────────────── */

export const ProcessMethodSchema = z.enum(["lavado", "honey", "natural"]);
export type ProcessMethod = z.output<typeof ProcessMethodSchema>;

export const LotStatusSchema = z.enum(["published", "draft"]);
export type LotStatus = z.output<typeof LotStatusSchema>;

export const LotSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug debe ser kebab-case"),
  name: z.string().min(1),
  status: LotStatusSchema.default("published"),
  species: LocalizedStringSchema,
  varieties: z.array(z.string().min(1)).min(1),
  altitudeMasl: z.number().int().min(0).max(3000),
  process: ProcessMethodSchema,
  processLabel: LocalizedStringSchema,
  harvestWindow: LocalizedStringSchema,
  /** Socio que ejecuta la tostión. */
  roaster: z.string().min(1),
  summary: LocalizedStringSchema,
  sensory: SensoryProfileSchema,
  /** Ids de FormatSchema; la integridad referencial se verifica al cargar. */
  formatIds: z.array(z.string().min(1)).min(1),
  image: ImageSchema.optional(),
});
export type Lot = z.output<typeof LotSchema>;

/* ───────────────────────────── Destacados ───────────────────────────── */

export const FeatureIconSchema = z.enum(["origin", "selection", "packaging"]);
export type FeatureIcon = z.output<typeof FeatureIconSchema>;

/** Los tres pilares que se muestran bajo el relato de marca. */
export const HighlightSchema = z.object({
  id: z.string().min(1),
  icon: FeatureIconSchema,
  title: LocalizedStringSchema,
  body: LocalizedStringSchema,
});
export type Highlight = z.output<typeof HighlightSchema>;

/* ──────────────────────────── Testimonios ──────────────────────────── */

export const TestimonialSchema = z.object({
  id: z.string().min(1),
  quote: LocalizedStringSchema,
  author: z.string().min(1),
  role: LocalizedStringSchema,
});
export type Testimonial = z.output<typeof TestimonialSchema>;

/* ─────────────────────── Cumplimiento y exportación ─────────────────────── */

export const ComplianceItemSchema = z.object({
  id: z.string().min(1),
  /** ISO-3166-1 alpha-2 del mercado destino. */
  market: z.string().length(2),
  authority: z.string().min(1),
  body: LocalizedStringSchema,
});
export type ComplianceItem = z.output<typeof ComplianceItemSchema>;

export const ValuePropSchema = z.object({
  id: z.string().min(1),
  title: LocalizedStringSchema,
  body: LocalizedStringSchema,
});
export type ValueProp = z.output<typeof ValuePropSchema>;

/** Un eslabón de la cadena: cultivo, tostión, exportación, importación. */
export const SupplyChainNodeSchema = z.object({
  id: z.string().min(1),
  role: LocalizedStringSchema,
  name: z.string().min(1),
  place: LocalizedStringSchema,
});
export type SupplyChainNode = z.output<typeof SupplyChainNodeSchema>;

export const ExportInfoSchema = z.object({
  compliance: z.array(ComplianceItemSchema).min(1),
  logistics: z.array(LocalizedStringSchema).min(1),
  valueProps: z.array(ValuePropSchema).min(1),
  supplyChain: z.array(SupplyChainNodeSchema).default([]),
  intro: LocalizedStringSchema,
});
export type ExportInfo = z.output<typeof ExportInfoSchema>;

/* ─────────────────────────────── Contacto ─────────────────────────────── */

export const PhoneSchema = z.object({
  id: z.string().min(1),
  /** Solo dígitos, en formato internacional (para wa.me). */
  e164: z.string().regex(/^\d{8,15}$/, "Usa solo dígitos en formato internacional"),
  display: z.string().min(1),
  region: LocalizedStringSchema,
  whatsapp: z.boolean().default(true),
});
export type Phone = z.output<typeof PhoneSchema>;

export const ContactSchema = z.object({
  brand: z.string().min(1),
  legalName: z.string().min(1),
  email: z.email(),
  instagram: z.string().regex(/^[A-Za-z0-9._]+$/, "Usuario de Instagram sin @"),
  phones: z.array(PhoneSchema).min(1),
  /** Número que atiende el botón flotante y los CTA principales. */
  primaryPhoneId: z.string().min(1),
  siteUrl: z.url(),
});
export type Contact = z.output<typeof ContactSchema>;
