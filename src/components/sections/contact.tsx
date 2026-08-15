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
import { Section, SectionHead } from "@/components/ui/section";

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
    <Section id="contacto" tone="dark" className="bg-ink-raised">
      <SectionHead
        index="06"
        label={dictionary.sections.contact.eyebrow}
        title={dictionary.contact.closing}
      />

      <div className="mt-16 grid gap-16 lg:mt-24 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <SampleRequestForm
            dictionary={dictionary}
            locale={locale}
            lotSlug={lotSlug}
            formats={formats.map((format) => ({
              id: format.id,
              label: formatWeight(format.grams, locale),
            }))}
          />
        </div>

        <div className="lg:col-span-4 lg:col-start-9">
          <dl className="border-ink-line border-t">
            {channels.map((channel, index) => (
              <Reveal key={channel.key} delay={index * 60}>
                <a
                  href={channel.href}
                  target={channel.external ? "_blank" : undefined}
                  rel="noopener"
                  className="group border-ink-line block border-b py-5"
                >
                  <dt className="meta text-bone-muted">{channel.key}</dt>
                  <dd className="font-display text-bone group-hover:text-cherry-bright mt-1.5 text-xl transition-colors">
                    {channel.value}
                  </dd>
                </a>
              </Reveal>
            ))}

            <Reveal delay={280}>
              <div className="border-ink-line border-b py-5">
                <dt className="meta text-bone-muted">{dictionary.contact.origin}</dt>
                <dd className="font-display text-bone mt-1.5 text-xl">
                  {estate.city}, {estate.department}, {estate.country}
                </dd>
              </div>
            </Reveal>
          </dl>
        </div>
      </div>
    </Section>
  );
}
