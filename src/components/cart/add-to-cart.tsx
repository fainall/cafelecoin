"use client";

import { useState } from "react";

import type { Dictionary } from "@/i18n";
import { useCart } from "@/lib/cart/store";

interface AddToCartProps {
  formatId: string;
  dictionary: Dictionary;
  /** Superficie donde se apoya: define los colores del control. */
  tone?: "dark" | "paper";
  disabled?: boolean;
}

/** Selector de cantidad y botón de agregar, con apertura del panel. */
export function AddToCart({
  formatId,
  dictionary,
  tone = "dark",
  disabled = false,
}: AddToCartProps) {
  const { add, setOpen } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const t = dictionary.cart;

  const claro = tone === "paper";
  const marco = claro ? "border-paper-line" : "border-forest-line";
  const pasos = claro ? "text-ink-soft hover:text-ink" : "text-cream-dim hover:text-cream";
  const cifra = claro ? "text-ink" : "text-cream";
  const boton = claro
    ? "bg-ink text-paper hover:bg-gold-deep"
    : "bg-gold text-forest-deep hover:bg-gold-light";

  if (disabled) {
    return (
      <p className={`label py-4 ${claro ? "text-ink-soft" : "text-cream-faint"}`}>
        {t.unavailable}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className={`flex items-center border ${marco}`}>
        <button
          type="button"
          onClick={() => setCantidad((n) => Math.max(1, n - 1))}
          className={`px-3 py-2.5 transition-colors ${pasos}`}
          aria-label={t.decrease}
        >
          −
        </button>
        <span className={`font-display w-10 text-center tabular-nums ${cifra}`}>{cantidad}</span>
        <button
          type="button"
          onClick={() => setCantidad((n) => Math.min(999, n + 1))}
          className={`px-3 py-2.5 transition-colors ${pasos}`}
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
        className={`font-display px-8 py-3.5 text-[0.72rem] tracking-[0.22em] uppercase transition-colors ${boton}`}
      >
        {t.add}
      </button>
    </div>
  );
}
