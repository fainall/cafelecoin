import type { Estate } from "@/content/schema";
import type { Dictionary } from "@/i18n";
import { translate, type Locale } from "@/i18n/config";
import { LandscapeBackdrop } from "@/components/ui/landscape-backdrop";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";

interface ProcessProps {
  estate: Estate;
  dictionary: Dictionary;
  locale: Locale;
}

/**
 * El ciclo completo dentro de la finca, de la siembra a la tostión, sobre el
 * paisaje de origen.
 *
 * Los pasos viven en la capa de contenido (estate.processSteps): agregar,
 * quitar o reordenar uno es editar ese archivo, no este componente.
 *
 * El paisaje va en dos planos que se separan al desplazarse (ver
 * LandscapeBackdrop), así que el texto queda quieto mientras el terreno se
 * mueve por detrás. El velo está calibrado para que los cerros se vean sin
 * comprometer la lectura.
 */
export function Process({ estate, dictionary, locale }: ProcessProps) {
  return (
    <Section
      id="proceso"
      tone="dark"
      backdrop={
        <LandscapeBackdrop veil="linear-gradient(to bottom, rgba(15,19,13,0.74) 0%, rgba(15,19,13,0.62) 38%, rgba(15,19,13,0.64) 72%, rgba(15,19,13,0.78) 100%)" />
      }
    >
      <div className="[text-shadow:0_1px_16px_rgba(0,0,0,0.45)]">
        <SectionHeading
          eyebrow={dictionary.sections.process.eyebrow}
          title={dictionary.sections.process.title}
        />

        <Reveal className="mx-auto mt-10 max-w-2xl text-center">
          <p className="text-cream-dim leading-relaxed">{dictionary.process.intro}</p>
        </Reveal>

        {/* El número hace de elemento gráfico: sin viñetas ni filete lateral. */}
        <ol className="mx-auto mt-14 grid max-w-4xl gap-x-14 lg:mt-16 lg:grid-cols-2">
          {estate.processSteps.map((step, index) => (
            <Reveal
              key={step.id}
              as="li"
              delay={index * 60}
              className="border-cream/15 flex gap-5 border-b py-6 last:border-b-0 lg:[&:nth-last-child(2)]:border-b-0"
            >
              <span
                className="font-display text-gold-light/70 mt-[2px] shrink-0 text-[2.75rem] leading-none tabular-nums"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <div>
                <h3 className="font-display text-cream text-lg tracking-[0.05em]">
                  {translate(step.title, locale)}
                </h3>
                <p className="text-cream-dim mt-1.5 text-base leading-relaxed">
                  {translate(step.body, locale)}
                </p>
                {step.partner && (
                  <p className="label text-gold-light mt-2.5">
                    {dictionary.process.partner} · {step.partner}
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  );
}
