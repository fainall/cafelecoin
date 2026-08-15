import type { ExportInfo } from "@/content/schema";
import type { Dictionary } from "@/i18n";
import { translate, type Locale } from "@/i18n/config";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHead } from "@/components/ui/section";

interface ExportSectionProps {
  exportInfo: ExportInfo;
  dictionary: Dictionary;
  locale: Locale;
}

export function ExportSection({ exportInfo, dictionary, locale }: ExportSectionProps) {
  return (
    <Section id="exportacion" tone="dark">
      <SectionHead
        index="05"
        label={dictionary.sections.export.eyebrow}
        title={dictionary.sections.export.title}
        lede={translate(exportInfo.intro, locale)}
      />

      <ul className="border-ink-line mt-16 grid gap-x-12 gap-y-10 border-t pt-10 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
        {exportInfo.valueProps.map((prop, index) => (
          <Reveal key={prop.id} as="li" delay={index * 80}>
            <span className="index text-cherry-bright">{String(index + 1).padStart(2, "0")}</span>
            <h3 className="font-display text-bone mt-3 text-xl">{translate(prop.title, locale)}</h3>
            <p className="text-bone-muted mt-2 max-w-[36ch] text-[0.95rem] leading-relaxed">
              {translate(prop.body, locale)}
            </p>
          </Reveal>
        ))}
      </ul>

      {exportInfo.supplyChain.length > 0 && (
        <div className="mt-20 lg:mt-28">
          <Reveal>
            <p className="meta text-bone-muted">{dictionary.export.supplyChain}</p>
          </Reveal>
          <ol className="border-ink-line mt-6 grid border-t sm:grid-cols-2 lg:grid-cols-4">
            {exportInfo.supplyChain.map((node, index) => (
              <Reveal
                key={node.id}
                as="li"
                delay={index * 70}
                className="border-ink-line border-b py-7 lg:border-r lg:pr-8 lg:last:border-r-0"
              >
                <span className="meta text-cherry-bright">{translate(node.role, locale)}</span>
                <p className="font-display text-bone mt-3 text-lg leading-snug">{node.name}</p>
                <p className="text-bone-muted mt-1 text-sm">{translate(node.place, locale)}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      )}

      <div className="mt-20 grid gap-14 lg:mt-24 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <Reveal>
            <p className="meta text-bone-muted">{dictionary.export.labelling}</p>
          </Reveal>
          <dl className="border-ink-line mt-6 border-t">
            {exportInfo.compliance.map((item, index) => (
              <Reveal
                key={item.id}
                delay={index * 70}
                className={`border-ink-line grid grid-cols-[3rem_1fr] gap-5 border-b py-5`}
              >
                <dt className="index text-bone-muted">{item.market}</dt>
                <dd>
                  <span className="font-display text-bone text-lg">{item.authority}</span>
                  <span className="text-bone-muted mt-1 block text-sm leading-relaxed">
                    {translate(item.body, locale)}
                  </span>
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-6">
          <Reveal>
            <p className="meta text-bone-muted">{dictionary.export.logistics}</p>
          </Reveal>
          <ul className="border-ink-line mt-6 border-t">
            {exportInfo.logistics.map((item, index) => (
              <Reveal
                key={translate(item, locale)}
                as="li"
                delay={index * 70}
                className="border-ink-line text-bone border-b py-5 text-[0.98rem] leading-relaxed"
              >
                {translate(item, locale)}
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
