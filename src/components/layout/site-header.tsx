"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
}

/**
 * Cabecera de trabajo: logotipo a la izquierda, navegación real a la derecha.
 * En móvil, un menú a pantalla completa.
 */
export function SiteHeader({
  locale,
  brand,
  items,
  ctaLabel,
  ctaHref,
  menuLabel,
  skipLabel,
}: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
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
        className="focus:bg-cherry focus:text-paper sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:px-4 focus:py-2 focus:text-xs"
      >
        {skipLabel}
      </a>

      <header
        data-scrolled={scrolled}
        className="data-[scrolled=true]:border-ink-line data-[scrolled=true]:bg-ink/92 fixed inset-x-0 top-0 z-50 border-b border-transparent transition-colors duration-300 data-[scrolled=true]:backdrop-blur-lg"
      >
        <div className="mx-auto flex w-full max-w-[100rem] items-center justify-between gap-10 px-6 py-5 sm:px-10 lg:px-16">
          <Link
            href={`/${locale}`}
            onClick={() => setOpen(false)}
            className="text-bone hover:text-cherry-bright shrink-0 transition-colors"
            aria-label={brand}
          >
            <Wordmark className="h-10 w-auto" />
          </Link>

          <nav aria-label={menuLabel} className="hidden items-center gap-9 lg:flex">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="meta text-bone-muted hover:text-bone transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <LocaleSwitcher current={locale} className="hidden sm:flex" />
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener"
              className="bg-cherry text-paper hover:bg-cherry-bright meta hidden px-5 py-3 transition-colors sm:inline-block"
            >
              {ctaLabel}
            </a>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="menu-principal"
              onClick={() => setOpen((value) => !value)}
              className="text-bone flex w-fit flex-col gap-[5px] py-2 lg:hidden"
            >
              <span className="sr-only">{menuLabel}</span>
              <span
                data-open={open}
                className="block h-px w-6 bg-current transition-transform duration-300 data-[open=true]:translate-y-[6px] data-[open=true]:rotate-45"
              />
              <span
                data-open={open}
                className="block h-px w-6 bg-current transition-opacity duration-300 data-[open=true]:opacity-0"
              />
              <span
                data-open={open}
                className="block h-px w-6 bg-current transition-transform duration-300 data-[open=true]:-translate-y-[6px] data-[open=true]:-rotate-45"
              />
            </button>
          </div>
        </div>
      </header>

      <div
        id="menu-principal"
        hidden={!open}
        className="bg-ink fixed inset-0 z-40 flex flex-col justify-center px-8 lg:hidden"
      >
        <nav aria-label={menuLabel} className="flex flex-col">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-ink-line font-display text-bone hover:text-cherry-bright border-b py-5 text-3xl transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-10 flex items-center justify-between">
          <LocaleSwitcher current={locale} />
          <a
            href={ctaHref}
            target="_blank"
            rel="noopener"
            className="bg-cherry text-paper meta px-5 py-3"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </>
  );
}
