import type { Locale } from "@/i18n/config";

/**
 * Enlace al formulario de cotización con los formatos ya marcados.
 *
 * Los identificadores viajan como parámetros repetidos (?formato=a&formato=b) y
 * el ancla lleva directo al formulario. El formulario los lee y los marca, para
 * que quien pide cotización no tenga que repetir lo que ya eligió.
 */
export function quoteHref(locale: Locale, formatIds: readonly string[] = []): string {
  const params = new URLSearchParams();
  for (const id of formatIds) params.append("formato", id);

  const consulta = params.toString();
  return `/${locale}${consulta ? `?${consulta}` : ""}#contacto`;
}

/** Formatos preseleccionados que llegan en la URL. */
export function readQuoteFormats(params: URLSearchParams): string[] {
  return params.getAll("formato").filter(Boolean);
}
