export const locales = ["es", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";

/** Etiquetas para el selector de idioma. */
export const localeLabels: Record<Locale, string> = {
  es: "Español",
  en: "English",
};

/** Códigos BCP-47 usados en <html lang> y en metadatos. */
export const localeTags: Record<Locale, string> = {
  es: "es-CO",
  en: "en",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Un valor de contenido traducido a cada idioma soportado.
 * Toda la capa de contenido usa este tipo, de modo que agregar un idioma
 * es una tarea de tipos (el compilador señala qué falta traducir).
 */
export type Localized<T> = Record<Locale, T>;

export function translate<T>(value: Localized<T>, locale: Locale): T {
  return value[locale] ?? value[defaultLocale];
}

/**
 * Negocia el idioma a partir del header Accept-Language.
 * Devuelve el idioma por defecto cuando no hay coincidencia.
 */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      const quality = q ? Number.parseFloat(q.split("=")[1]) : 1;
      return { tag: tag.toLowerCase(), quality: Number.isNaN(quality) ? 0 : quality };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }

  return defaultLocale;
}
