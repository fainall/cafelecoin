import Link from "next/link";

import type { Contact, Estate } from "@/content/schema";
import { instagramUrl } from "@/content/helpers";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { ContourScene } from "@/components/ui/scenes";
import { Wordmark } from "@/components/ui/wordmark";
import { LocaleSwitcher } from "./locale-switcher";

interface SiteFooterProps {
  locale: Locale;
  dictionary: Dictionary;
  contact: Contact;
  estate: Estate;
}

export function SiteFooter({ locale, dictionary, contact, estate }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-forest-deep relative overflow-hidden">
      {/* Plano de origen: curvas de nivel de la zona cafetera */}
      <div className="absolute inset-0 opacity-[0.10]" aria-hidden="true">
        <ContourScene />
      </div>

      <div className="relative mx-auto w-full max-w-[82rem] px-6 py-20 text-center sm:px-10">
        <span className="bg-gold mx-auto block h-1.5 w-1.5 rotate-45" aria-hidden="true" />
        <span
          className="via-gold/40 mx-auto mt-4 block h-14 w-px bg-gradient-to-b from-transparent to-transparent"
          aria-hidden="true"
        />

        <p className="label text-cream-dim mt-6">
          {estate.city} · {estate.department} · {estate.country}
        </p>

        <Link
          href={`/${locale}`}
          className="text-cream hover:text-gold-light mx-auto mt-10 block w-fit transition-colors"
          aria-label={contact.brand}
        >
          <Wordmark className="mx-auto h-16 w-auto" />
        </Link>

        <p className="font-display text-cream-dim mt-8 text-lg tracking-[0.04em]">
          {dictionary.footer.claim}
        </p>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {contact.phones.map((phone) => (
            <li key={phone.id}>
              <a
                href={`tel:+${phone.e164}`}
                className="label text-cream-faint hover:text-gold-light transition-colors"
              >
                {phone.display}
              </a>
            </li>
          ))}
          <li>
            <a
              href={`mailto:${contact.email}`}
              className="label text-cream-faint hover:text-gold-light transition-colors"
            >
              {contact.email}
            </a>
          </li>
          <li>
            <a
              href={instagramUrl(contact)}
              target="_blank"
              rel="noopener"
              className="label text-cream-faint hover:text-gold-light transition-colors"
            >
              @{contact.instagram}
            </a>
          </li>
        </ul>

        <div className="border-forest-line/60 mt-12 flex flex-col items-center gap-4 border-t pt-8 sm:flex-row sm:justify-between">
          <p className="label text-cream-faint">
            © {year} {contact.legalName}. {dictionary.footer.rights}
          </p>
          <LocaleSwitcher current={locale} />
        </div>
      </div>
    </footer>
  );
}
