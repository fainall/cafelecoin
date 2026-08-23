import type { ExportInfo } from "@/content/schema";
import type { Dictionary } from "@/i18n";
import { translate, type Locale } from "@/i18n/config";
import { TornEdge } from "@/components/ui/divider";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";

interface ExportSectionProps {
  exportInfo: ExportInfo;
  dictionary: Dictionary;
  locale: Locale;
}

export function ExportSection({ exportInfo, dictionary, locale }: ExportSectionProps) {
  return (
    <>
      <TornEdge fill="fill-forest" behind="bg-paper" seed={88} />
      <Section id="exportacion" tone="dark" className="pt-6 sm:pt-10 lg:pt-12">
        <SectionHeading
          eyebrow={dictionary.sections.export.eyebrow}
          title={dictionary.sections.export.title}
        />

        <Reveal className="prose mx-auto mt-10 text-center">
          <p className="text-cream-dim leading-relaxed">{translate(exportInfo.intro, locale)}</p>
        </Reveal>

        <ul className="border-forest-line mx-auto mt-16 grid max-w-6xl gap-px border sm:grid-cols-2 lg:grid-cols-4">
          {exportInfo.valueProps.map((prop, index) => (
            <Reveal
              key={prop.id}
              as="li"
              delay={index * 90}
              className="bg-forest flex h-full flex-col gap-3 p-8 text-center"
            >
              <span className="text-gold mx-auto block h-1.5 w-1.5 rotate-45 bg-current" />
              <h3 className="font-display text-cream mt-2 text-sm tracking-[0.2em] uppercase">
                {translate(prop.title, locale)}
              </h3>
              <p className="text-cream-dim text-base leading-relaxed">
                {translate(prop.body, locale)}
              </p>
            </Reveal>
          ))}
        </ul>

        {exportInfo.supplyChain.length > 0 && (
          <div className="mx-auto mt-20 max-w-6xl">
            <Reveal>
              <h3 className="label text-gold-light text-center">{dictionary.export.supplyChain}</h3>
            </Reveal>
            <ol className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {exportInfo.supplyChain.map((node, index) => (
                <Reveal key={node.id} as="li" delay={index * 80} className="text-center">
                  <span className="label text-cream-faint">{translate(node.role, locale)}</span>
                  <p className="font-display text-cream mt-3 text-base tracking-[0.06em]">
                    {node.name}
                  </p>
                  <p className="text-cream-dim mt-1.5 text-base">{translate(node.place, locale)}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        )}

        <div className="mx-auto mt-20 grid max-w-5xl gap-16 lg:grid-cols-2">
          <div>
            <Reveal>
              <h3 className="label text-gold-light text-center">{dictionary.export.labelling}</h3>
            </Reveal>
            <ul className="mt-8 space-y-6">
              {exportInfo.compliance.map((item, index) => (
                <Reveal key={item.id} as="li" delay={index * 70} className="flex gap-5">
                  <span className="border-forest-line text-cream-faint label flex h-9 w-11 shrink-0 items-center justify-center border">
                    {item.market}
                  </span>
                  <p className="text-cream-dim text-base leading-relaxed">
                    <strong className="text-cream font-normal">{item.authority}</strong>
                    <span className="block">{translate(item.body, locale)}</span>
                  </p>
                </Reveal>
              ))}
            </ul>
          </div>

          <div>
            <Reveal>
              <h3 className="label text-gold-light text-center">{dictionary.export.logistics}</h3>
            </Reveal>
            <ul className="mt-8 space-y-5">
              {exportInfo.logistics.map((item, index) => (
                <Reveal
                  key={translate(item, locale)}
                  as="li"
                  delay={index * 70}
                  className="text-cream-dim flex gap-4 text-base leading-relaxed"
                >
                  <span className="bg-gold mt-3.5 h-px w-5 shrink-0" aria-hidden="true" />
                  {translate(item, locale)}
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
}
