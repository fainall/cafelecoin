import { Suspense } from "react";

import {
  formatWeight,
  instagramUrl,
  mailtoUrl,
  sampleRequestMessage,
  whatsappUrl,
} from "@/content/helpers";
import type { Contact as ContactInfo, Estate, Format } from "@/content/schema";
import type { Dictionary } from "@/i18n";
import { translate, type Locale } from "@/i18n/config";
import { SampleRequestForm } from "@/components/forms/sample-request-form";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";

interface ContactProps {
  contact: ContactInfo;
  estate: Estate;
  formats: Format[];
  dictionary: Dictionary;
  locale: Locale;
  lotSlug?: string;
  lotName?: string;
}

export function Contact({
  contact,
  estate,
  formats,
  dictionary,
  locale,
  lotSlug,
  lotName,
}: ContactProps) {
  const message = sampleRequestMessage(locale, lotName);

  const channels = [
    ...contact.phones.map((phone) => ({
      key: `${dictionary.contact.whatsapp} · ${translate(phone.region, locale)}`,
      value: phone.display,
      href: phone.whatsapp ? whatsappUrl(phone, message) : `tel:+${phone.e164}`,
      external: phone.whatsapp,
    })),
    {
      key: dictionary.contact.email,
      value: contact.email,
      href: mailtoUrl(
        contact,
        locale === "en" ? "Sample request — Le Coin" : "Solicitud de muestras — Le Coin",
      ),
      external: false,
    },
    {
      key: dictionary.contact.instagram,
      value: `@${contact.instagram}`,
      href: instagramUrl(contact),
      external: true,
    },
  ];

  return (
    <Section id="contacto" tone="dark" className="bg-forest-deep">
      <SectionHeading
        eyebrow={dictionary.sections.contact.eyebrow}
        title={dictionary.sections.contact.title}
      />

      <Reveal className="mx-auto mt-8 max-w-2xl text-center">
        <p className="font-display text-gold-light text-xl tracking-[0.04em] sm:text-2xl">
          {dictionary.contact.closing}
        </p>
      </Reveal>

      <div className="mt-16 grid gap-16 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-7">
          {/* useSearchParams necesita frontera de Suspense: la página es
              estática y el formulario lee la preselección en el navegador. */}
          <Suspense fallback={<div className="min-h-[32rem]" />}>
            <SampleRequestForm
              dictionary={dictionary}
              locale={locale}
              lotSlug={lotSlug}
              formats={formats.map((format) => ({
                id: format.id,
                label: formatWeight(format.grams, locale),
              }))}
            />
          </Suspense>
        </div>

        <div className="lg:col-span-5">
          <ul className="border-forest-line border-t">
            {channels.map((channel, index) => (
              <Reveal key={channel.key} as="li" delay={index * 60}>
                <a
                  href={channel.href}
                  target={channel.external ? "_blank" : undefined}
                  rel="noopener"
                  className="group border-forest-line flex flex-wrap items-baseline justify-between gap-4 border-b py-5"
                >
                  <span className="label text-cream-faint">{channel.key}</span>
                  <span className="font-display text-cream group-hover:text-gold-light text-lg tracking-[0.04em] transition-colors">
                    {channel.value}
                  </span>
                </a>
              </Reveal>
            ))}

            <Reveal as="li" delay={300}>
              <div className="border-forest-line flex flex-wrap items-baseline justify-between gap-4 border-b py-5">
                <span className="label text-cream-faint">{dictionary.contact.origin}</span>
                <span className="font-display text-cream text-lg tracking-[0.04em]">
                  {estate.city}, {estate.department} — {estate.country}
                </span>
              </div>
            </Reveal>
          </ul>
        </div>
      </div>
    </Section>
  );
}
