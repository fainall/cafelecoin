"use client";

import { useCart } from "@/lib/cart/store";

/** Acceso al pedido, con el número de unidades. */
export function CartButton({ label }: { label: string }) {
  const { units, setOpen } = useCart();

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="text-cream hover:text-gold-light relative flex items-center gap-2 py-2 transition-colors"
      aria-label={label}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          d="M6 7h12l-1 12H7L6 7Z"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M9.5 7a2.5 2.5 0 0 1 5 0" strokeWidth="1.3" strokeLinecap="round" />
      </svg>

      {units > 0 && (
        <span className="bg-gold text-forest-deep absolute -top-0.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-sans text-[0.62rem] font-medium">
          {units}
        </span>
      )}
    </button>
  );
}
