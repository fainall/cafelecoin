import type { Estate } from "@/content/schema";
import type { Dictionary } from "@/i18n";
import { translate, type Locale } from "@/i18n/config";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";

interface ProcessProps {
  estate: Estate;
  dictionary: Dictionary;
  locale: Locale;
}

/**
 * El ciclo completo dentro de la finca, de la siembra a la tostión.
 *
 * Los pasos viven en la capa de contenido (estate.processSteps): agregar,
 * quitar o reordenar uno es editar ese archivo, no este componente.
 *
 * La banda superior es la acuarela del propio empaque —rama de café con cerezas
 * maduras, hojas y granos—, que es el lenguaje con el que la marca ya cuenta su
 * origen. Se muestra apaisada, en la proporción en la que está impresa.
 */
export function Process({ estate, dictionary, locale }: ProcessProps) {
  return (
    <Section id="proceso" tone="paper" className="bg-paper-soft">
      <SectionHeading
        eyebrow={dictionary.sections.process.eyebrow}
        title={dictionary.sections.process.title}
        tone="paper"
      />

      <Reveal className="mx-auto mt-10 max-w-2xl text-center">
        <p className="text-ink-soft leading-relaxed">{dictionary.process.intro}</p>
      </Reveal>

      <Reveal delay={80} className="mx-auto mt-12 max-w-4xl lg:mt-14">
        <figure>
          <Photo
            src="/img/botanica.webp"
            alt={
              locale === "en"
                ? "Watercolour from the Le Coin packaging: coffee branch with ripe cherries, leaves and beans"
                : "Acuarela del empaque de Le Coin: rama de café con cerezas maduras, hojas y granos"
            }
            className="aspect-[5/2] w-full sm:aspect-[3/1]"
            sizes="(max-width: 1024px) 100vw, 56rem"
            fallback={<div className="bg-paper h-full w-full" />}
          />
          <figcaption className="label text-ink-soft mt-3 text-center">
            {estate.city}, {estate.department} · {estate.country}
          </figcaption>
        </figure>
      </Reveal>

      {/* Mismo ancho que la banda: los filetes y el borde de la imagen alinean. */}
      <ol className="border-paper-line mx-auto mt-14 max-w-4xl border-l pl-8 lg:mt-16">
        {estate.processSteps.map((step, index) => (
          <Reveal
            key={step.id}
            as="li"
            delay={index * 60}
            className="relative pb-8 last:pb-0 lg:pb-9"
          >
            {/* Marcador sobre el filete */}
            <span
              className="border-gold bg-paper-soft absolute top-[7px] -left-8 block h-[9px] w-[9px] -translate-x-1/2 rotate-45 border"
              aria-hidden="true"
            />

            <div className="flex gap-4">
              <span className="label text-gold-deep w-6 shrink-0 pt-[3px]">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div>
                <h3 className="font-display text-ink text-lg tracking-[0.05em]">
                  {translate(step.title, locale)}
                </h3>
                <p className="text-ink-soft mt-1.5 max-w-[52ch] text-base leading-relaxed">
                  {translate(step.body, locale)}
                </p>
                {step.partner && (
                  <p className="label text-gold-deep mt-2.5">
                    {dictionary.process.partner} · {step.partner}
                  </p>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
