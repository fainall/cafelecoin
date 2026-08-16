import type { Money } from "@/content/schema";
import { localeTags, type Locale } from "@/i18n/config";

/** Monedas sin decimales: el importe entero ya es el monto final. */
const SIN_DECIMALES = new Set(["CLP", "COP"]);

/**
 * Formatea un importe para mostrarlo.
 * El peso chileno y el colombiano no llevan decimales; forzarlos a dos daría
 * "$10.990,00", que en esos mercados se lee como error.
 */
export function formatMoney(money: Money, locale: Locale): string {
  const fractionDigits = SIN_DECIMALES.has(money.currency) ? 0 : 2;

  return new Intl.NumberFormat(localeTags[locale], {
    style: "currency",
    currency: money.currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(money.amount);
}

/** Suma importes de la misma moneda. */
export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`No se pueden sumar ${a.currency} y ${b.currency}`);
  }
  return { amount: a.amount + b.amount, currency: a.currency };
}
