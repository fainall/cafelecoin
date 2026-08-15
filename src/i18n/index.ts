import { es, type Dictionary } from "./dictionaries/es";
import { en } from "./dictionaries/en";
import type { Locale } from "./config";

const dictionaries: Record<Locale, Dictionary> = { es, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? es;
}

export { dictionaries };
export type { Dictionary };
export * from "./config";
