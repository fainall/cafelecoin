import type { Estate, Format } from "@/content/schema";
import { formatWeight } from "@/content/helpers";
import { translate, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { FloatingBeans } from "@/components/ui/beans";
import { ParallaxLayer } from "@/components/ui/parallax";
import { Photo } from "@/components/ui/photo";
import { ProductShot } from "@/components/ui/product-shot";
import { Reveal } from "@/components/ui/reveal";
import { MountainScene } from "@/components/ui/scenes";

interface HeroProps {
  estate: Estate;
  /** Formato que protagoniza la portada (el retail de 250 g). */
  hero: Format;
  dictionary: Dictionary;
  locale: Locale;
}

/**
 * Portada en tres planos con parallax:
 *
 *   fondo (cordillera y bruma) ── se queda atrás
 *   producto ─────────────────── acompaña a la página
 *   ladera en primer plano ───── se adelanta y tapa la base del empaque
 *
 * La ladera se recorta de la misma fotografía (scripts/separar-planos.mjs), así
 * que al hacer scroll el empaque se hunde detrás del cerro real, no de un
 * dibujo. En móvil solo se mueve el fondo: menos trabajo para la batería.
 */
export function Hero({ estate, hero, dictionary, locale }: HeroProps) {
  const marquee = [
    { es: "100% Arábica", en: "100% Arabica" },
    { es: "Finca propia", en: "Our own farm" },
    { es: "Recolección a mano", en: "Hand-picked" },
    { es: "Secado al sol", en: "Sun-dried" },
    { es: "Trazabilidad total", en: "Full traceability" },
  ].map((item) => translate(item, locale));

  const alt = estate.image ? translate(estate.image.alt, locale) : "";

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden pt-28 sm:pt-32">
      {/* Plano lejano */}
      <ParallaxLayer speed={0.3} className="absolute inset-0">
        {estate.image ? (
          <Photo
            src={estate.image.src}
            alt={alt}
            focus={estate.image.focus}
            priority
            sizes="100vw"
            className="h-full w-full"
            fallback={<MountainScene />}
          />
        ) : (
          <MountainScene />
        )}
      </ParallaxLayer>

      {/* Nubes a la deriva sobre el cielo de la fotografía. La máscara las
          disuelve antes de llegar a la cordillera, para que no se vea el corte
          de la capa. */}
      <div
        className="animate-nubes pointer-events-none absolute inset-x-[-10%] top-0 h-[58%] [mask-image:linear-gradient(to_bottom,black_0%,black_45%,transparent_100%)] opacity-40 mix-blend-screen"
        aria-hidden="true"
      >
        <Photo
          src="/img/cielo.webp"
          alt=""
          sizes="120vw"
          className="h-full w-full"
          fallback={<span />}
        />
      </div>

      <div
        // Oscurece arriba para el titular y abajo para la cinta, dejando
        // respirar la franja central donde entra la luz del amanecer.
        className="from-forest-deep/92 via-forest/35 to-forest absolute inset-0 bg-gradient-to-b"
        aria-hidden="true"
      />

      <ParallaxLayer
        speed={-0.14}
        fade
        className="relative z-10 mx-auto w-full max-w-4xl px-6 text-center sm:px-10"
      >
        <Reveal>
          <h1 className="display-xl text-cream text-[clamp(1.75rem,4.6vw,3.75rem)]">
            {translate(estate.tagline, locale)}
          </h1>
        </Reveal>
        <Reveal delay={140}>
          <p className="text-cream-dim mx-auto mt-6 max-w-xl text-lg italic sm:text-xl">
            {translate(estate.subTagline, locale)}
          </p>
        </Reveal>
        <Reveal delay={240}>
          <p className="label text-gold-light mt-5">{dictionary.hero.eyebrow}</p>
        </Reveal>
      </ParallaxLayer>

      {/* Plano medio: el producto */}
      <ParallaxLayer
        speed={0.06}
        className="relative z-10 mx-auto mt-8 w-full max-w-3xl flex-1 px-6"
      >
        <FloatingBeans className="hidden sm:block" />

        <Reveal delay={320} className="relative flex h-full items-end justify-center">
          {/* Sombra de apoyo: evita que el empaque parezca pegado encima */}
          <span
            className="absolute bottom-2 left-1/2 h-10 w-[46%] -translate-x-1/2 rounded-[50%] bg-black/55 blur-2xl"
            aria-hidden="true"
          />
          <ProductShot
            src={hero.image?.src ?? ""}
            alt={
              hero.image
                ? translate(hero.image.alt, locale)
                : `Le Coin ${formatWeight(hero.grams, locale)}`
            }
            caption={formatWeight(hero.grams, locale)}
            priority
            sizes="(max-width: 640px) 62vw, 360px"
            className="relative h-[42svh] max-h-[460px] min-h-[260px] w-[min(62vw,300px)]"
          />
        </Reveal>

        <Reveal
          delay={420}
          className="text-gold-light absolute right-2 bottom-8 hidden text-right lg:block"
        >
          <p className="font-display text-3xl tracking-[0.12em]">100%</p>
          <p className="label text-cream-dim mt-1">
            {locale === "en" ? "Single Estate Coffee" : "Café de finca propia"}
          </p>
        </Reveal>
      </ParallaxLayer>

      {/* Plano cercano: la ladera recortada, por delante del empaque */}
      {estate.image && (
        <ParallaxLayer
          speed={-0.07}
          className="pointer-events-none absolute inset-0 z-20 hidden sm:block"
        >
          <Photo
            src="/img/finca-frente.webp"
            // Decorativa: es el mismo terreno que ya describe la capa de fondo.
            alt=""
            focus={estate.image.focus}
            priority
            sizes="100vw"
            className="h-full w-full"
            fallback={<span />}
          />
          <div
            className="to-forest absolute inset-0 bg-gradient-to-b from-transparent via-transparent"
            aria-hidden="true"
          />
        </ParallaxLayer>
      )}

      {/* Cinta de atributos */}
      <div className="border-forest-line/70 bg-forest-deep/75 relative z-30 mt-8 border-y py-3.5 backdrop-blur-sm">
        <div className="animate-ticker flex w-max gap-12 whitespace-nowrap" aria-hidden="true">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex gap-12">
              {marquee.map((item) => (
                <li
                  key={`${copy}-${item}`}
                  className="label text-cream-faint flex items-center gap-12"
                >
                  {item}
                  <span className="text-gold/70">◆</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
