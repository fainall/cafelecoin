"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CartButton } from "@/components/cart/cart-button";
import { Wordmark } from "@/components/ui/wordmark";
import type { Locale } from "@/i18n/config";
import { LocaleSwitcher } from "./locale-switcher";

export interface NavItem {
  href: string;
  label: string;
}

interface SiteHeaderProps {
  locale: Locale;
  brand: string;
  items: NavItem[];
  ctaLabel: string;
  ctaHref: string;
  menuLabel: string;
  skipLabel: string;
  cartLabel: string;
  /** Perfil de Instagram, al pie del menú abierto. */
  instagramHref: string;
  instagramHandle: string;
}

/** Glifo de Instagram: el cuadro, la lente y el punto del flash. */
function InstagramGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth="1.3" />
      <circle cx="12" cy="12" r="4" strokeWidth="1.3" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Cabecera ceremonial: logotipo centrado, menú a la izquierda, idioma a la
 * derecha. El menú abre a pantalla completa con los enlaces centrados.
 */
export function SiteHeader({
  locale,
  brand,
  items,
  ctaLabel,
  ctaHref,
  menuLabel,
  skipLabel,
  cartLabel,
  instagramHref,
  instagramHandle,
}: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <a
        href="#contenido"
        className="focus:bg-gold focus:text-forest-deep sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:px-4 focus:py-2 focus:text-xs"
      >
        {skipLabel}
      </a>

      <header
        data-scrolled={scrolled}
        className="data-[scrolled=true]:border-forest-line/70 data-[scrolled=true]:bg-forest/92 fixed inset-x-0 top-0 z-50 border-b border-transparent transition-all duration-500 data-[scrolled=true]:backdrop-blur-xl"
      >
        <div className="mx-auto grid w-full max-w-[82rem] grid-cols-3 items-center px-6 py-4 sm:px-10">
          <button
            type="button"
            aria-expanded={open}
            aria-controls="menu-principal"
            onClick={() => setOpen((value) => !value)}
            className="text-cream hover:text-gold-light flex w-fit flex-col gap-[5px] py-2 transition-colors"
          >
            <span className="sr-only">{menuLabel}</span>
            <span
              data-open={open}
              className="block h-px w-7 bg-current transition-transform duration-300 data-[open=true]:translate-y-[6px] data-[open=true]:rotate-45"
            />
            <span
              data-open={open}
              className="block h-px w-7 bg-current transition-opacity duration-300 data-[open=true]:opacity-0"
            />
            <span
              data-open={open}
              className="block h-px w-5 bg-current transition-all duration-300 data-[open=true]:w-7 data-[open=true]:-translate-y-[6px] data-[open=true]:-rotate-45"
            />
          </button>

          <Link
            href={`/${locale}`}
            onClick={() => setOpen(false)}
            className="text-cream hover:text-gold-light mx-auto transition-colors"
            aria-label={brand}
          >
            <Wordmark className="h-12 w-auto sm:h-14" />
          </Link>

          <div className="flex items-center justify-end gap-5">
            <CartButton label={cartLabel} />
            <LocaleSwitcher current={locale} />
          </div>
        </div>
      </header>

      <div
        id="menu-principal"
        hidden={!open}
        className="bg-forest-deep/98 fixed inset-0 z-40 flex flex-col items-center justify-center gap-2 px-8 backdrop-blur-xl"
      >
        <nav aria-label={menuLabel} className="flex flex-col items-center gap-1">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="font-display text-cream hover:text-gold-light py-3 text-2xl tracking-[0.16em] uppercase transition-colors sm:text-3xl"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href={ctaHref}
          target="_blank"
          rel="noopener"
          className="border-gold/50 text-gold-light hover:bg-gold hover:text-forest-deep font-display mt-10 border px-9 py-4 text-[0.72rem] tracking-[0.22em] uppercase transition-colors"
        >
          {ctaLabel}
        </a>

        <a
          href={instagramHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setOpen(false)}
          className="label text-cream-faint hover:text-gold-light mt-10 flex items-center gap-2.5 transition-colors"
        >
          <InstagramGlyph />
          {instagramHandle}
        </a>
      </div>
    </>
  );
}
