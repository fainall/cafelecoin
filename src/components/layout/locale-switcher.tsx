"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isLocale, locales, type Locale } from "@/i18n/config";

interface LocaleSwitcherProps {
  current: Locale;
  className?: string;
}

/** Cambia de idioma conservando la ruta actual (/es/cafe/x → /en/cafe/x). */
export function LocaleSwitcher({ current, className = "" }: LocaleSwitcherProps) {
  const pathname = usePathname() ?? `/${current}`;

  const buildHref = (locale: Locale) => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && isLocale(segments[0])) {
      segments[0] = locale;
    } else {
      segments.unshift(locale);
    }
    return `/${segments.join("/")}`;
  };

  return (
    <div
      className={`label flex items-center gap-1.5 ${className}`}
    >
      {locales.map((locale, index) => (
        <span key={locale} className="flex items-center gap-1">
          {index > 0 && <span className="text-cream-faint">/</span>}
          <Link
            href={buildHref(locale)}
            aria-current={locale === current ? "true" : undefined}
            className={
              locale === current
                ? "text-gold-light uppercase"
                : "text-cream-faint hover:text-cream uppercase transition-colors"
            }
          >
            {locale}
          </Link>
        </span>
      ))}
    </div>
  );
}
