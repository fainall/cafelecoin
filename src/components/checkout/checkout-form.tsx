"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { formatWeight } from "@/content/helpers";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { formatMoney } from "@/lib/cart/money";
import { useCart } from "@/lib/cart/store";
import { orderCountries } from "@/lib/orders/schema";

interface CheckoutFormProps {
  dictionary: Dictionary;
  locale: Locale;
}

interface Traspaso {
  kind: "redirect" | "whatsapp";
  url: string;
}

interface Confirmacion {
  code: string;
  handoff: Traspaso | null;
}

type Estado = "idle" | "enviando" | "error";

const campo =
  "w-full border-b border-forest-line bg-transparent py-3 font-sans text-sm text-cream placeholder:text-cream-faint focus:border-gold focus:outline-none transition-colors";
const etiqueta = "label text-cream-faint";

export function CheckoutForm({ dictionary, locale }: CheckoutFormProps) {
  const t = dictionary.checkout;
  const { summary, lines, clear } = useCart();
  const [estado, setEstado] = useState<Estado>("idle");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [confirmado, setConfirmado] = useState<Confirmacion | null>(null);

  /* ─────────────────────────── Pedido confirmado ─────────────────────────── */

  if (confirmado) {
    const porWhatsapp = confirmado.handoff?.kind === "whatsapp";

    return (
      <div className="border-gold/50 bg-gold/10 mx-auto max-w-2xl border p-10 text-center">
        <p className="label text-gold-light">{t.confirmedTitle}</p>
        <p className="font-display text-cream mt-4 text-3xl tracking-[0.16em]">{confirmado.code}</p>
        <p className="text-cream-dim mt-5 leading-relaxed">
          {porWhatsapp ? t.confirmedWhatsapp : t.confirmedPaid}
        </p>

        {confirmado.handoff && (
          <a
            href={confirmado.handoff.url}
            target={porWhatsapp ? "_blank" : undefined}
            rel={porWhatsapp ? "noopener noreferrer" : undefined}
            className="bg-gold text-forest-deep font-display hover:bg-gold-light mt-8 inline-block px-9 py-4 text-[0.72rem] tracking-[0.22em] uppercase transition-colors"
          >
            {porWhatsapp ? t.confirmedCtaWhatsapp : t.confirmedCtaPay}
          </a>
        )}

        {!confirmado.handoff && (
          <p className="text-cream-faint mt-6 text-sm">{t.confirmedManual}</p>
        )}

        <p className="mt-8">
          <Link
            href={`/${locale}/tienda`}
            className="label text-cream-faint hover:text-gold-light transition-colors"
          >
            {t.backToShop}
          </Link>
        </p>
      </div>
    );
  }

  /* ───────────────────────────── Carrito vacío ───────────────────────────── */

  if (summary.lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="text-cream-dim">{dictionary.cart.empty}</p>
        <p className="mt-8">
          <Link
            href={`/${locale}/tienda`}
            className="label text-gold-light hover:text-gold transition-colors"
          >
            {t.backToShop}
          </Link>
        </p>
      </div>
    );
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEstado("enviando");
    setErrores({});

    const datos = new FormData(evento.currentTarget);
    const cuerpo = {
      lines,
      name: datos.get("name"),
      email: datos.get("email"),
      phone: datos.get("phone"),
      country: datos.get("country"),
      region: datos.get("region"),
      city: datos.get("city"),
      address: datos.get("address"),
      notes: datos.get("notes"),
      website: datos.get("website"),
      locale,
    };

    try {
      const respuesta = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(cuerpo),
      });

      const resultado = (await respuesta.json().catch(() => null)) as {
        ok?: boolean;
        code?: string;
        handoff?: Traspaso | null;
        fields?: Record<string, string>;
      } | null;

      if (!respuesta.ok || !resultado?.ok || !resultado.code) {
        setErrores(resultado?.fields ?? {});
        setEstado("error");
        return;
      }

      // El carrito se vacía solo cuando el pedido ya quedó registrado.
      clear();
      setConfirmado({ code: resultado.code, handoff: resultado.handoff ?? null });

      // Con pasarela conectada se va directo a pagar.
      if (resultado.handoff?.kind === "redirect") {
        window.location.href = resultado.handoff.url;
      }
    } catch {
      setEstado("error");
    }
  }

  return (
    <div className="grid gap-14 lg:grid-cols-[1fr_22rem] lg:gap-20">
      <form onSubmit={enviar} noValidate className="grid gap-8 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <p className="font-display text-cream text-sm tracking-[0.28em] uppercase">
            {t.dataTitle}
          </p>
          <p className="text-cream-faint mt-3">{t.dataIntro}</p>
        </div>

        <Campo label={t.name} name="name" error={errores.name} required>
          <input id="name" name="name" required autoComplete="name" className={campo} />
        </Campo>

        <Campo label={t.email} name="email" error={errores.email} required>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={campo}
          />
        </Campo>

        <Campo label={t.phone} name="phone" error={errores.phone} required>
          <input id="phone" name="phone" type="tel" required autoComplete="tel" className={campo} />
        </Campo>

        <Campo label={t.country} name="country" error={errores.country} required>
          <select id="country" name="country" required defaultValue="CL" className={campo}>
            {orderCountries.map((code) => (
              <option key={code} value={code} className="bg-forest-deep">
                {dictionary.form.countries[code]}
              </option>
            ))}
          </select>
        </Campo>

        <Campo label={t.region} name="region" error={errores.region} required>
          <input
            id="region"
            name="region"
            required
            autoComplete="address-level1"
            className={campo}
          />
        </Campo>

        <Campo label={t.city} name="city" error={errores.city} required>
          <input id="city" name="city" required autoComplete="address-level2" className={campo} />
        </Campo>

        <Campo
          label={t.address}
          name="address"
          error={errores.address}
          required
          className="sm:col-span-2"
        >
          <input
            id="address"
            name="address"
            required
            autoComplete="street-address"
            className={campo}
          />
        </Campo>

        <Campo
          label={`${t.notes} (${dictionary.form.optional})`}
          name="notes"
          error={errores.notes}
          className="sm:col-span-2"
        >
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder={t.notesPlaceholder}
            className={`${campo} resize-none`}
          />
        </Campo>

        {/* Trampa anti-spam: oculta para personas, visible para bots. */}
        <div aria-hidden="true" className="hidden">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
          <Button type="submit" disabled={estado === "enviando"}>
            {estado === "enviando" ? t.submitting : t.submit}
          </Button>
          {estado === "error" && (
            <p role="alert" className="text-danger text-sm">
              {t.error}
            </p>
          )}
        </div>
      </form>

      {/* ───────────────────────────── Resumen ───────────────────────────── */}

      <aside className="border-forest-line h-fit border p-8">
        <p className="font-display text-cream text-sm tracking-[0.28em] uppercase">
          {t.summaryTitle}
        </p>

        <ul className="mt-6 space-y-4">
          {summary.lines.map((line) => (
            <li key={line.format.id} className="flex justify-between gap-4 text-sm">
              <span className="text-cream-dim">
                {line.quantity} × {formatWeight(line.format.grams, locale)}
              </span>
              <span className="text-cream">{formatMoney(line.subtotal, locale)}</span>
            </li>
          ))}
        </ul>

        <div className="border-forest-line mt-6 flex items-baseline justify-between border-t pt-5">
          <span className="label text-cream-faint">{dictionary.cart.total}</span>
          <span className="font-display text-cream text-2xl tracking-[0.06em]">
            {formatMoney(summary.total, locale)}
          </span>
        </div>

        <p className="text-cream-faint mt-4 text-sm">{dictionary.cart.shippingNote}</p>
      </aside>
    </div>
  );
}

interface CampoProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

function Campo({ label, name, error, required, className = "", children }: CampoProps) {
  return (
    <div className={className}>
      <label htmlFor={name} className={etiqueta}>
        {label}
        {required && <span className="text-gold-light"> *</span>}
      </label>
      <div className="mt-2">{children}</div>
      {error && (
        <p className="text-danger mt-2 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
