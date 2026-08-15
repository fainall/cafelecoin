"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { leadChannels, leadCountries } from "@/lib/leads/schema";

export interface FormatOption {
  id: string;
  label: string;
}

interface SampleRequestFormProps {
  dictionary: Dictionary;
  locale: Locale;
  formats: FormatOption[];
  /** Preselecciona el lote cuando el formulario se abre desde su ficha. */
  lotSlug?: string;
}

type Status = "idle" | "submitting" | "success" | "error";

const fieldClass =
  "w-full border-b border-ink-line bg-transparent py-3 font-sans text-sm text-bone placeholder:text-bone-muted focus:border-cherry focus:outline-none transition-colors";
const labelClass = "meta text-bone-muted";

export function SampleRequestForm({
  dictionary,
  locale,
  formats,
  lotSlug,
}: SampleRequestFormProps) {
  const t = dictionary.form;
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrors({});

    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: data.get("name"),
      company: data.get("company"),
      email: data.get("email"),
      phone: data.get("phone"),
      country: data.get("country"),
      channel: data.get("channel"),
      monthlyVolumeKg: data.get("monthlyVolumeKg"),
      formatIds: data.getAll("formatIds").map(String),
      message: data.get("message"),
      consent: data.get("consent") === "on",
      website: data.get("website"),
      lotSlug,
      locale,
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          fields?: Record<string, string>;
        } | null;
        setErrors(body?.fields ?? {});
        setStatus("error");
        return;
      }

      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="border-cherry/50 bg-cherry/10 border p-10 text-center">
        <p className="text-bone text-xl leading-relaxed italic">{t.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-8 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <p className="font-display text-bone text-sm tracking-[0.28em] uppercase">{t.title}</p>
        <p className="text-bone-muted mt-3">{t.intro}</p>
      </div>

      <Field label={t.name} name="name" error={errors.name} required>
        <input id="name" name="name" required autoComplete="name" className={fieldClass} />
      </Field>

      <Field label={t.company} name="company" error={errors.company} required>
        <input
          id="company"
          name="company"
          required
          autoComplete="organization"
          className={fieldClass}
        />
      </Field>

      <Field label={t.email} name="email" error={errors.email} required>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={fieldClass}
        />
      </Field>

      <Field label={`${t.phone} (${t.optional})`} name="phone" error={errors.phone}>
        <input id="phone" name="phone" type="tel" autoComplete="tel" className={fieldClass} />
      </Field>

      <Field label={t.country} name="country" error={errors.country} required>
        <select id="country" name="country" required defaultValue="CL" className={fieldClass}>
          {leadCountries.map((code) => (
            <option key={code} value={code} className="bg-ink">
              {t.countries[code]}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t.channel} name="channel" error={errors.channel} required>
        <select id="channel" name="channel" required defaultValue="cafe" className={fieldClass}>
          {leadChannels.map((code) => (
            <option key={code} value={code} className="bg-ink">
              {t.channels[code]}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label={`${t.volume} (${t.optional})`}
        name="monthlyVolumeKg"
        error={errors.monthlyVolumeKg}
      >
        <input
          id="monthlyVolumeKg"
          name="monthlyVolumeKg"
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          className={fieldClass}
        />
      </Field>

      <fieldset className="sm:col-span-2">
        <legend className={labelClass}>{t.formats}</legend>
        <div className="mt-4 flex flex-wrap gap-3">
          {formats.map((format) => (
            <label
              key={format.id}
              className="border-ink-line text-bone-muted has-checked:border-cherry has-checked:text-cherry-bright meta flex cursor-pointer items-center gap-2 border px-4 py-2.5 transition-colors"
            >
              <input
                type="checkbox"
                name="formatIds"
                value={format.id}
                className="accent-cherry h-3 w-3"
              />
              {format.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Field
        label={`${t.message} (${t.optional})`}
        name="message"
        error={errors.message}
        className="sm:col-span-2"
      >
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder={t.messagePlaceholder}
          className={`${fieldClass} resize-none`}
        />
      </Field>

      {/* Trampa anti-spam: oculta para personas, visible para bots. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="sm:col-span-2">
        <label className="text-bone-muted flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="consent"
            required
            className="accent-cherry mt-1 h-4 w-4 shrink-0"
          />
          <span>{t.consent}</span>
        </label>
        {errors.consent && <p className="text-danger mt-2 text-sm">{errors.consent}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? t.submitting : t.submit}
        </Button>
        {status === "error" && (
          <p role="alert" className="text-danger text-sm">
            {t.error}
          </p>
        )}
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

function Field({ label, name, error, required, className = "", children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={name} className={labelClass}>
        {label}
        {required && <span className="text-cherry-bright"> *</span>}
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
