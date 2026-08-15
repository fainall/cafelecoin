import { localeTags, translate, type Locale, type Localized } from "@/i18n/config";
import type { Contact, Format, Lot, Phone, ProductLine } from "./schema";

/** Traduce un campo opcional sin obligar a encadenar comprobaciones en la vista. */
export function translateOrNull<T>(value: Localized<T> | undefined, locale: Locale): T | undefined {
  return value ? translate(value, locale) : undefined;
}

/** 250 g · 500 g · 1 kg · 2.5 kg — la etiqueta siempre se deriva de los gramos. */
export function formatWeight(grams: number, locale: Locale): string {
  const tag = localeTags[locale];
  if (grams >= 1000) {
    const kg = grams / 1000;
    const value = new Intl.NumberFormat(tag, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(kg);
    return `${value} kg`;
  }
  return `${new Intl.NumberFormat(tag).format(grams)} g`;
}

export function formatAltitude(masl: number, locale: Locale): string {
  return new Intl.NumberFormat(localeTags[locale]).format(masl);
}

export function getPhone(contact: Contact, id: string): Phone | undefined {
  return contact.phones.find((phone) => phone.id === id);
}

export function getPrimaryPhone(contact: Contact): Phone {
  const phone = getPhone(contact, contact.primaryPhoneId);
  // La integridad ya fue validada al cargar el contenido.
  return phone ?? contact.phones[0];
}

export function whatsappUrl(phone: Phone, message?: string): string {
  const base = `https://wa.me/${phone.e164}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function instagramUrl(contact: Contact): string {
  return `https://instagram.com/${contact.instagram}`;
}

export function mailtoUrl(contact: Contact, subject: string): string {
  return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}`;
}

export function formatsByLine(formats: Format[], line: ProductLine): Format[] {
  return formats.filter((format) => format.line === line).sort((a, b) => a.grams - b.grams);
}

export function lotPath(locale: Locale, lot: Pick<Lot, "slug">): string {
  return `/${locale}/cafe/${lot.slug}`;
}

/** Mensaje precargado de WhatsApp para los CTA de muestras. */
export function sampleRequestMessage(locale: Locale, lotName?: string): string {
  if (locale === "en") {
    return lotName
      ? `Hello Le Coin, I would like to request cupping samples of ${lotName}.`
      : "Hello Le Coin, I would like to request cupping samples.";
  }
  return lotName
    ? `Hola Le Coin, quisiera solicitar muestras para catación del lote ${lotName}.`
    : "Hola Le Coin, quisiera solicitar muestras para catación.";
}
