import type { Estate, Testimonial } from "@/content/schema";
import type { Dictionary } from "@/i18n";
import { translate, type Locale } from "@/i18n/config";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHead } from "@/components/ui/section";

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
    <Section id="testimonios" tone="light">
      <SectionHead
        index="04"
        label={dictionary.sections.testimonials.eyebrow}
        title={dictionary.sections.testimonials.title}
        tone="light"
      />

      {testimonials.length === 0 ? (
        <Reveal delay={90} className="mt-16 grid lg:grid-cols-12">
          <blockquote className="lg:col-span-8 lg:col-start-4">
            <p className="display text-graphite text-[clamp(1.75rem,3.6vw,2.9rem)]">
              {translate(estate.claim, locale)}
            </p>
          </blockquote>
        </Reveal>
      ) : (
        <ul className="border-paper-line mt-16 grid gap-px border-t lg:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <Reveal
              key={testimonial.id}
              as="li"
              delay={index * 90}
              className="border-paper-line border-b py-10 lg:pr-12"
            >
              <blockquote className="font-display text-graphite text-2xl leading-snug">
                {translate(testimonial.quote, locale)}
              </blockquote>
              <p className="meta text-cherry mt-6">{testimonial.author}</p>
              <p className="meta text-graphite-muted mt-1">{translate(testimonial.role, locale)}</p>
            </Reveal>
          ))}
        </ul>
      )}
    </Section>
  );
}
