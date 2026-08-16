"use client";

import Image from "next/image";
import { useEffect } from "react";

import { formatWeight } from "@/content/helpers";
import type { Dictionary } from "@/i18n";
import { translate, type Locale } from "@/i18n/config";
import { formatMoney } from "@/lib/cart/money";
import { useCart } from "@/lib/cart/store";

interface CartDrawerProps {
  dictionary: Dictionary;
  locale: Locale;
  /** Enlace al formulario de cotización, para pedidos mayoristas. */
  quoteHref: string;
}

/** Panel lateral con el pedido en curso. */
export function CartDrawer({ dictionary, locale, quoteHref }: CartDrawerProps) {
  const { summary, open, setOpen, setQty, remove, units } = useCart();
  const t = dictionary.cart;

  useEffect(() => {
    if (!open) return;
    const alCerrar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", alCerrar);
    return () => window.removeEventListener("keydown", alCerrar);
  }, [open, setOpen]);

  return (
    <>
      <div
        hidden={!open}
        onClick={() => setOpen(false)}
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      <aside
        hidden={!open}
        aria-label={t.title}
        className="bg-forest-deep border-forest-line fixed inset-y-0 right-0 z-[61] flex w-full max-w-md flex-col border-l"
      >
        <header className="border-forest-line flex items-center justify-between border-b px-6 py-5">
          <div>
            <p className="font-display text-cream text-sm tracking-[0.22em] uppercase">{t.title}</p>
            {units > 0 && (
              <p className="label text-cream-faint mt-1">
                {units} {t.units}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="label text-cream-faint hover:text-cream transition-colors"
          >
            {t.close}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {summary.lines.length === 0 ? (
            <p className="text-cream-dim py-10 text-center">{t.empty}</p>
          ) : (
            <ul className="space-y-6">
              {summary.lines.map((line) => (
                <li key={line.format.id} className="flex gap-4">
                  {/* Aquí no se puede usar Photo: comprueba el disco con
                      node:fs y este componente corre en el navegador. */}
                  <div className="border-forest-line bg-forest relative h-24 w-20 shrink-0 border p-2">
                    {line.format.image && (
                      <Image
                        src={line.format.image.src}
                        alt={translate(line.format.image.alt, locale)}
                        fill
                        sizes="80px"
                        className="object-contain p-1"
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-display text-cream text-base tracking-[0.06em]">
                      {formatWeight(line.format.grams, locale)}
                    </p>
                    <p className="label text-cream-faint mt-1">
                      {formatMoney(line.unit, locale)} {t.each}
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="border-forest-line flex items-center border">
                        <button
                          type="button"
                          onClick={() => setQty(line.format.id, line.quantity - 1)}
                          className="text-cream-dim hover:text-cream px-3 py-1 transition-colors"
                          aria-label={t.decrease}
                        >
                          −
                        </button>
                        <span className="font-display text-cream w-8 text-center text-sm tabular-nums">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(line.format.id, line.quantity + 1)}
                          className="text-cream-dim hover:text-cream px-3 py-1 transition-colors"
                          aria-label={t.increase}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(line.format.id)}
                        className="label text-cream-faint hover:text-danger transition-colors"
                      >
                        {t.remove}
                      </button>
                    </div>
                  </div>

                  <p className="font-display text-cream text-base tracking-[0.06em]">
                    {formatMoney(line.subtotal, locale)}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {summary.unavailable.length > 0 && (
            <p className="border-danger/40 text-cream-dim mt-6 border-l-2 pl-4 text-sm">
              {t.removedUnavailable}
            </p>
          )}
        </div>

        {summary.lines.length > 0 && (
          <footer className="border-forest-line border-t px-6 py-6">
            <div className="flex items-baseline justify-between">
              <span className="label text-cream-faint">{t.total}</span>
              <span className="font-display text-cream text-2xl tracking-[0.06em]">
                {formatMoney(summary.total, locale)}
              </span>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <span className="label text-cream-faint">{t.weight}</span>
              <span className="text-cream-dim text-sm">
                {formatWeight(summary.weightGrams, locale)}
              </span>
            </div>

            <p className="text-cream-faint mt-4 text-sm">{t.shippingNote}</p>

            <button
              type="button"
              disabled
              title="Disponible al conectar Mercado Pago"
              className="bg-gold text-forest-deep font-display mt-5 w-full px-9 py-4 text-[0.72rem] tracking-[0.22em] uppercase disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t.checkout}
            </button>

            <a
              href={quoteHref}
              onClick={() => setOpen(false)}
              className="border-forest-line text-cream-dim hover:text-cream font-display mt-3 block w-full border px-9 py-4 text-center text-[0.72rem] tracking-[0.22em] uppercase transition-colors"
            >
              {t.quote}
            </a>
          </footer>
        )}
      </aside>
    </>
  );
}
