import { formatAltitude } from "@/content/helpers";
import type { Estate, Lot } from "@/content/schema";
import type { Dictionary } from "@/i18n";
import { translate, type Locale } from "@/i18n/config";
import { surfaces, type Tone } from "./surface";

interface TechnicalSheetProps {
  lot: Lot;
  estate: Estate;
  dictionary: Dictionary;
  locale: Locale;
  tone?: Tone;
}

/**
 * Ficha técnica del origen: tabla de datos, sin adornos. La misma sirve en la
 * portada (lote destacado) y en la página de cada lote.
 */
export function TechnicalSheet({
  lot,
  estate,
  dictionary,
  locale,
  tone = "light",
}: TechnicalSheetProps) {
  const s = surfaces[tone];

  const rows: Array<{ key: string; value: string }> = [
    { key: dictionary.origin.species, value: translate(lot.species, locale) },
    { key: dictionary.origin.variety, value: lot.varieties.join(", ") },
    {
      key: dictionary.origin.altitude,
      value: `${formatAltitude(lot.altitudeMasl, locale)} ${dictionary.origin.masl}`,
    },
    {
      key: dictionary.origin.region,
      value: `${estate.city}, ${estate.department}, ${estate.country}`,
    },
    { key: dictionary.origin.process, value: translate(lot.processLabel, locale) },
    {
      key: dictionary.origin.harvest,
      value: locale === "en" ? "Hand-picked, selective" : "Manual, selectiva",
    },
    {
      key: dictionary.origin.drying,
      value: locale === "en" ? "Solar, controlled at the farm" : "Solar, controlado en finca",
    },
    {
      key: dictionary.origin.fertilization,
      value: locale === "en" ? "Vermiculture (organic)" : "Lumbricultura (orgánica)",
    },
    {
      key: dictionary.origin.water,
      value: locale === "en" ? "Own natural spring" : "Manantial propio",
    },
    { key: dictionary.origin.roasting, value: lot.roaster },
    {
      key: dictionary.origin.traceability,
      value: locale === "en" ? "Single estate" : "Single estate — finca propia",
    },
  ];

  return (
    <dl className={`border-t ${s.line}`}>
      {rows.map((row) => (
        <div
          key={row.key}
          className={`grid grid-cols-[8rem_1fr] items-baseline gap-6 border-b py-3.5 sm:grid-cols-[11rem_1fr] ${s.line}`}
        >
          <dt className={`meta ${s.muted}`}>{row.key}</dt>
          <dd className={`font-display text-[1.0625rem] ${s.text}`}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
