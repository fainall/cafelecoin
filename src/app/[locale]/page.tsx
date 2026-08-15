import { notFound } from "next/navigation";

import { Band } from "@/components/sections/band";
import { Coffee } from "@/components/sections/coffee";
import { Contact } from "@/components/sections/contact";
import { ExportSection } from "@/components/sections/export-section";
import { Hero } from "@/components/sections/hero";
import { OriginProfile } from "@/components/sections/origin-profile";
import { Products } from "@/components/sections/products";
import { Testimonials } from "@/components/sections/testimonials";
import { content } from "@/content";
import { getDictionary } from "@/i18n";
import { isLocale, type Locale } from "@/i18n/config";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;

  const dictionary = getDictionary(locale);
  const [estate, formats, lots, exportInfo, contactInfo, highlights, testimonials] =
    await Promise.all([
      content.getEstate(),
      content.getFormats(),
      content.getLots(),
      content.getExportInfo(),
      content.getContact(),
      content.getHighlights(),
      content.getTestimonials(),
    ]);

  // El lote destacado alimenta la ficha técnica y el perfil sensorial de la portada.
  const featured = lots[0];
  if (!featured) notFound();

  // La portada la protagoniza el formato retail; si no existe, el primero.
  const heroFormat = formats.find((format) => format.line === "retail") ?? formats[0];

  return (
    <>
      <Hero estate={estate} hero={heroFormat} dictionary={dictionary} locale={locale} />
      <Coffee estate={estate} highlights={highlights} dictionary={dictionary} locale={locale} />
      <Products formats={formats} lots={lots} dictionary={dictionary} locale={locale} />
      <OriginProfile lot={featured} estate={estate} dictionary={dictionary} locale={locale} />
      <Band dictionary={dictionary} />
      <Testimonials
        testimonials={testimonials}
        estate={estate}
        dictionary={dictionary}
        locale={locale}
      />
      <ExportSection exportInfo={exportInfo} dictionary={dictionary} locale={locale} />
      <Contact
        contact={contactInfo}
        estate={estate}
        formats={formats}
        dictionary={dictionary}
        locale={locale}
      />
    </>
  );
}
