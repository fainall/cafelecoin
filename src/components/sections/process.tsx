import type { Estate } from "@/content/schema";
import type { Dictionary } from "@/i18n";
import { translate, type Locale } from "@/i18n/config";
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
 * La línea de tiempo va centrada en escritorio con los pasos alternando lados,
 * y se colapsa a una sola columna con el filete a la izquierda en móvil.
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

      <ol className="relative mx-auto mt-16 max-w-4xl lg:mt-20">
        {/* Filete que une los pasos */}
        <span
          className="via-gold/45 absolute top-2 bottom-2 left-[11px] w-px bg-gradient-to-b from-transparent to-transparent lg:left-1/2"
          aria-hidden="true"
        />

        {estate.processSteps.map((step, index) => {
          const izquierda = index % 2 === 0;

          return (
            <Reveal
              key={step.id}
              as="li"
              delay={index * 70}
              className="relative pb-12 pl-10 last:pb-0 lg:pb-14 lg:pl-0"
            >
              {/* Marcador sobre el filete */}
              <span
                className="border-gold bg-paper-soft absolute top-1.5 left-[11px] block h-[9px] w-[9px] -translate-x-1/2 rotate-45 border lg:left-1/2"
                aria-hidden="true"
              />

              <div className="grid lg:grid-cols-2 lg:gap-16">
                <div
                  className={
                    izquierda
                      ? "lg:col-start-1 lg:pr-2 lg:text-right"
                      : "lg:col-start-2 lg:pl-2 lg:text-left"
                  }
                >
                  <span className="label text-gold-deep">{String(index + 1).padStart(2, "0")}</span>

                  <h3 className="font-display text-ink mt-3 text-xl tracking-[0.06em]">
                    {translate(step.title, locale)}
                  </h3>

                  <p className="text-ink-soft mt-2.5 max-w-[42ch] leading-relaxed lg:inline-block">
                    {translate(step.body, locale)}
                  </p>

                  {step.partner && (
                    <p className="label text-gold-deep mt-4">
                      {dictionary.process.partner} · {step.partner}
                    </p>
                  )}
                </div>
              </div>
            </Reveal>
          );
        })}
      </ol>
    </Section>
  );
}
