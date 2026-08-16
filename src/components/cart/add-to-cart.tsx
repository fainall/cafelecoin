"use client";

import { useState } from "react";

import type { Dictionary } from "@/i18n";
import { useCart } from "@/lib/cart/store";

interface AddToCartProps {
  formatId: string;
  dictionary: Dictionary;
  disabled?: boolean;
}

/** Selector de cantidad y botón de agregar, con apertura del panel. */
export function AddToCart({ formatId, dictionary, disabled = false }: AddToCartProps) {
  const { add, setOpen } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const t = dictionary.cart;

  if (disabled) {
    return <p className="label text-cream-faint py-4">{t.unavailable}</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="border-forest-line flex items-center border">
        <button
          type="button"
          onClick={() => setCantidad((n) => Math.max(1, n - 1))}
          className="text-cream-dim hover:text-cream px-3 py-2.5 transition-colors"
          aria-label={t.decrease}
        >
          −
        </button>
        <span className="font-display text-cream w-10 text-center tabular-nums">{cantidad}</span>
        <button
          type="button"
          onClick={() => setCantidad((n) => Math.min(999, n + 1))}
          className="text-cream-dim hover:text-cream px-3 py-2.5 transition-colors"
          aria-label={t.increase}
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          add(formatId, cantidad);
          setCantidad(1);
          setOpen(true);
        }}
        className="bg-gold text-forest-deep hover:bg-gold-light font-display px-8 py-3.5 text-[0.72rem] tracking-[0.22em] uppercase transition-colors"
      >
        {t.add}
      </button>
    </div>
  );
}
