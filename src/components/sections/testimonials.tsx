import type { Estate, Testimonial } from "@/content/schema";
import type { Dictionary } from "@/i18n";
import { translate, type Locale } from "@/i18n/config";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";

interface TestimonialsProps {
  testimonials: Testimonial[];
  estate: Estate;
  dictionary: Dictionary;
  locale: Locale;
}

/**
 * Testimonios de clientes. Mientras no haya ninguno cargado no se inventan
 * citas: el espacio lo ocupa la frase de marca.
 */
export function Testimonials({ testimonials, estate, dictionary, locale }: TestimonialsProps) {
  return (
    // Va pegada a la ficha de origen, que ya es papel: sin la banda dorada en
    // medio, las dos separaciones sumaban un vacío de crema de 256 px.
    <Section id="testimonios" tone="paper" className="pt-0 sm:pt-0 lg:pt-0">
      <SectionHeading
        eyebrow={dictionary.sections.testimonials.eyebrow}
        title={dictionary.sections.testimonials.title}
        tone="paper"
      />

      {testimonials.length === 0 ? (
        <Reveal delay={120} className="mx-auto mt-12 max-w-2xl text-center">
          <p className="font-display text-ink text-[clamp(1.4rem,3vw,2.1rem)] leading-snug">
            «{translate(estate.claim, locale)}»
          </p>
        </Reveal>
      ) : (
        <ul className="mx-auto mt-12 grid max-w-5xl gap-12 sm:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.id} as="li" delay={index * 110} className="text-center">
              <p className="text-ink text-xl leading-relaxed italic">
                «{translate(testimonial.quote, locale)}»
              </p>
              <p className="label text-gold-deep mt-6">{testimonial.author}</p>
              <p className="label text-ink-soft mt-1">{translate(testimonial.role, locale)}</p>
            </Reveal>
          ))}
        </ul>
      )}
    </Section>
  );
}
