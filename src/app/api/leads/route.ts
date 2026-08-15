import { NextResponse } from "next/server";

import { fieldErrors, LeadInputSchema, type StoredLead } from "@/lib/leads/schema";
import { getLeadStore } from "@/lib/leads/store";
import { clientIp, createMemoryRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const limiter = createMemoryRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

export async function POST(request: Request) {
  const ip = clientIp(request.headers);
  const rate = await limiter.check(`leads:${ip}`);

  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "retry-after": String(rate.retryAfter) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = LeadInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_error", fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const { website, ...lead } = parsed.data;

  // Trampa anti-spam completada: se responde 200 para no darle señal al bot.
  if (website) {
    return NextResponse.json({ ok: true, id: "ignored" });
  }

  const stored: StoredLead = {
    ...lead,
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    userAgent: request.headers.get("user-agent") ?? undefined,
    referer: request.headers.get("referer") ?? undefined,
  };

  try {
    await getLeadStore().save(stored);
  } catch (error) {
    console.error("[leads] no se pudo registrar la solicitud", error);
    return NextResponse.json({ ok: false, error: "storage_error" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, id: stored.id }, { status: 201 });
}
