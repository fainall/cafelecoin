import { formatAltitude, formatWeight } from "@/content/helpers";
import type { Estate, Lot } from "@/content/schema";
import type { Dictionary } from "@/i18n";
import { translate, type Locale } from "@/i18n/config";
import { TornEdge } from "@/components/ui/divider";
import { Meter } from "@/components/ui/meter";
import { ProductShot } from "@/components/ui/product-shot";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { TechnicalSheet } from "@/components/ui/technical-sheet";

interface OriginProfileProps {
  lot: Lot;
  estate: Estate;
  dictionary: Dictionary;
  locale: Locale;
}

/** Ficha técnica y perfil sensorial del lote destacado, sobre papel. */
export function OriginProfile({ lot, estate, dictionary, locale }: OriginProfileProps) {
  const { sensory } = lot;

  return (
    <>
      <TornEdge fill="fill-paper" behind="bg-forest" />
      <Section id="origen" tone="paper" className="pt-16 sm:pt-20 lg:pt-24">
        <SectionHeading
          eyebrow={dictionary.sections.origin.eyebrow}
          title={dictionary.sections.origin.title}
          tone="paper"
        />

        <Reveal className="mx-auto mt-10 max-w-2xl text-center">
          <p className="font-display text-ink text-sm tracking-[0.22em] uppercase">{lot.name}</p>
          <p className="text-ink-soft prose mx-auto mt-4 leading-relaxed">
            {translate(lot.summary, locale)}
          </p>
        </Reveal>

        <div className="mt-16 grid gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <h3 className="label text-gold-deep mb-6 text-center lg:text-left">
                {dictionary.lot.technicalSheet}
              </h3>
            </Reveal>
            <TechnicalSheet
              lot={lot}
              estate={estate}
              dictionary={dictionary}
              locale={locale}
              tone="paper"
            />

            <Reveal delay={120} className="border-paper-line mt-10 border p-8 text-center">
              <p className="label text-ink-soft">{dictionary.origin.altitude}</p>
              <p className="font-display text-gold-deep mt-3 text-5xl tracking-[0.04em]">
                {formatAltitude(lot.altitudeMasl, locale)}
                <span className="label text-ink-soft ml-3 align-middle">
                  {dictionary.origin.masl}
                </span>
              </p>
              <p className="text-ink-soft mx-auto mt-4 max-w-sm leading-relaxed">
                {dictionary.origin.altitudeCaption}
              </p>
            </Reveal>
          </div>

          <div id="perfil" className="scroll-mt-28">
            <Reveal>
              <h3 className="label text-gold-deep mb-6 text-center lg:text-left">
                {dictionary.sections.profile.eyebrow} {dictionary.sections.profile.title}
              </h3>
            </Reveal>

            <Reveal delay={60}>
              <ul className="flex flex-wrap justify-center gap-2 lg:justify-start">
                {sensory.notes.map((note) => (
                  <li
                    key={translate(note, locale)}
                    className="border-paper-line text-ink-soft label border px-4 py-2"
                  >
                    {translate(note, locale)}
                  </li>
                ))}
              </ul>
            </Reveal>

            <div className="mt-10">
              {sensory.attributes.map((attribute, index) => (
                <Meter
                  key={attribute.id}
                  tone="paper"
                  label={translate(attribute.label, locale)}
                  value={attribute.value}
                  display={attribute.display ? translate(attribute.display, locale) : undefined}
                  delay={index * 60}
                />
              ))}
            </div>

            {sensory.scaScore !== undefined && (
              <Reveal delay={200} className="mt-10 text-center lg:text-left">
                <p className="label text-ink-soft">{dictionary.profile.scoreLabel}</p>
                <p className="font-display text-ink mt-2 text-6xl leading-none">
                  {sensory.scaScore}
                  <sup className="text-gold-deep ml-1 align-super text-2xl">+</sup>
                </p>
                <p className="label text-gold-deep mt-2">{dictionary.profile.scoreUnit}</p>
                <p className="text-ink-soft mt-4 max-w-md text-base">
                  {dictionary.profile.scoreNote}
                </p>
              </Reveal>
            )}

            <Reveal delay={260}>
              <p className="text-ink-soft mt-8 text-base italic">
                {translate(sensory.summary, locale)}
              </p>
            </Reveal>
          </div>
        </div>

        <Reveal
          delay={80}
          className="border-paper-line mt-20 flex flex-col items-center gap-8 border-t pt-12 sm:flex-row sm:items-end lg:mt-24"
        >
          <ProductShot
            src="/img/producto-250g-reverso.webp"
            alt={
              locale === "en"
                ? "Back label of the Le Coin bag with origin, roaster and export details"
                : "Etiqueta trasera de la bolsa Le Coin con origen, tostador y datos de exportación"
            }
            caption={formatWeight(250, locale)}
            tone="paper"
            sizes="(max-width: 640px) 55vw, 200px"
            className="h-64 w-40 shrink-0"
          />
          <p className="text-ink-soft prose text-center text-base leading-relaxed sm:text-left">
            {locale === "en"
              ? "Every bag carries its origin, its roaster and the full export chain printed on the back. Traceability you can read before you cup it."
              : "Cada bolsa lleva impresos su origen, su tostador y la cadena de exportación completa. Trazabilidad que se lee antes de catarla."}
          </p>
        </Reveal>
      </Section>
    </>
  );
}
