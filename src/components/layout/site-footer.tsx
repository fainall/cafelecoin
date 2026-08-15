import Link from "next/link";

import type { Contact, Estate } from "@/content/schema";
import { instagramUrl } from "@/content/helpers";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
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
    <footer className="bg-ink border-ink-line border-t">
      <div className="mx-auto w-full max-w-[100rem] px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link
              href={`/${locale}`}
              className="text-bone hover:text-cherry-bright inline-block transition-colors"
              aria-label={contact.brand}
            >
              <Wordmark className="h-12 w-auto" />
            </Link>
            <p className="font-display text-bone-muted mt-6 max-w-[30ch] text-lg">
              {dictionary.footer.claim}
            </p>
          </div>

          <div className="lg:col-span-3">
            <p className="meta text-bone-muted">{dictionary.contact.origin}</p>
            <p className="text-bone mt-3 text-[0.98rem]">
              {estate.city}, {estate.department}
              <br />
              {estate.country}
            </p>
          </div>

          <div className="lg:col-span-3">
            <p className="meta text-bone-muted">{dictionary.contact.whatsapp}</p>
            <ul className="mt-3 space-y-1.5">
              {contact.phones.map((phone) => (
                <li key={phone.id}>
                  <a
                    href={`tel:+${phone.e164}`}
                    className="text-bone hover:text-cherry-bright text-[0.98rem] transition-colors"
                  >
                    {phone.display}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="meta text-bone-muted">{dictionary.contact.email}</p>
            <a
              href={`mailto:${contact.email}`}
              className="text-bone hover:text-cherry-bright mt-3 block text-[0.98rem] transition-colors"
            >
              {contact.email}
            </a>
            <a
              href={instagramUrl(contact)}
              target="_blank"
              rel="noopener"
              className="text-bone hover:text-cherry-bright mt-3 block text-[0.98rem] transition-colors"
            >
              @{contact.instagram}
            </a>
          </div>
        </div>

        <div className="border-ink-line mt-16 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="meta text-bone-muted">
            © {year} {contact.legalName} · {dictionary.footer.rights}
          </p>
          <LocaleSwitcher current={locale} />
        </div>
      </div>
    </footer>
  );
}
