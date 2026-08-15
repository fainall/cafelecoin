import { formatAltitude } from "@/content/helpers";
import type { Estate, Lot } from "@/content/schema";
import type { Dictionary } from "@/i18n";
import { translate, type Locale } from "@/i18n/config";
import { Meter } from "@/components/ui/meter";
import { ProductShot } from "@/components/ui/product-shot";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHead } from "@/components/ui/section";
import { TechnicalSheet } from "@/components/ui/technical-sheet";

interface OriginProfileProps {
  lot: Lot;
  estate: Estate;
  dictionary: Dictionary;
  locale: Locale;
}

/** Ficha técnica y perfil sensorial del lote destacado. */
export function OriginProfile({ lot, estate, dictionary, locale }: OriginProfileProps) {
  const { sensory } = lot;

  return (
    <Section id="origen" tone="light">
      <SectionHead
        index="03"
        label={dictionary.sections.origin.eyebrow}
        title={dictionary.sections.origin.title}
        lede={translate(lot.summary, locale)}
        tone="light"
      />

      <div className="mt-16 grid gap-14 lg:mt-24 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-3">
          <Reveal>
            <p className="meta text-graphite-muted">{dictionary.lot.technicalSheet}</p>
            <p className="font-display text-graphite mt-3 text-xl">{lot.name}</p>
          </Reveal>

          <Reveal delay={100} className="mt-10">
            <p className="index text-cherry">{dictionary.origin.altitude}</p>
            <p className="display text-graphite mt-2 text-5xl">
              {formatAltitude(lot.altitudeMasl, locale)}
              <span className="meta text-graphite-muted ml-2 align-middle">
                {dictionary.origin.masl}
              </span>
            </p>
            <p className="text-graphite-muted mt-4 max-w-[34ch] text-sm leading-relaxed">
              {dictionary.origin.altitudeCaption}
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-5">
          <TechnicalSheet
            lot={lot}
            estate={estate}
            dictionary={dictionary}
            locale={locale}
            tone="light"
          />
        </div>

        <div className="lg:col-span-4">
          <Reveal>
            <p className="meta text-graphite-muted">{dictionary.lot.cupping}</p>
          </Reveal>

          <Reveal delay={60}>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              {sensory.notes.map((note) => (
                <li key={translate(note, locale)} className="font-display text-graphite text-lg">
                  {translate(note, locale)}
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="mt-10">
            {sensory.attributes.map((attribute, index) => (
              <Meter
                key={attribute.id}
                tone="light"
                label={translate(attribute.label, locale)}
                value={attribute.value}
                display={attribute.display ? translate(attribute.display, locale) : undefined}
                delay={index * 50}
              />
            ))}
          </div>

          {sensory.scaScore !== undefined && (
            <Reveal delay={160} className="mt-8 flex items-baseline gap-4">
              <span className="display text-graphite text-5xl tabular-nums">
                {sensory.scaScore}
              </span>
              <span className="meta text-graphite-muted">{dictionary.profile.scoreUnit}</span>
            </Reveal>
          )}
        </div>
      </div>

      <Reveal delay={80} className="border-paper-line mt-20 grid gap-10 border-t pt-12 sm:grid-cols-[220px_1fr] lg:mt-28">
        <ProductShot
          src="/img/producto-250g-reverso.webp"
          alt={
            locale === "en"
              ? "Back label of the Le Coin bag with origin, roaster and export details"
              : "Etiqueta trasera de la bolsa Le Coin con origen, tostador y datos de exportación"
          }
          caption={dictionary.lot.technicalSheet}
          tone="light"
          sizes="(max-width: 640px) 60vw, 220px"
          className="h-72 w-full"
        />
        <p className="prose-editorial text-graphite-muted self-center">
          {locale === "en"
            ? "Every bag carries its origin, its roaster and the full export chain printed on the back. Traceability you can read before you cup it."
            : "Cada bolsa lleva impresos su origen, su tostador y la cadena de exportación completa. Trazabilidad que se lee antes de catarla."}
        </p>
      </Reveal>
    </Section>
  );
}
