/**
 * Limitador de peticiones por ventana deslizante.
 *
 * La implementación en memoria alcanza para una instancia; el contrato
 * RateLimiter permite cambiarla por Redis/Upstash en despliegues multi-instancia
 * sin tocar los endpoints.
 */
export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  /** Segundos hasta que se libere un cupo. */
  retryAfter: number;
}

export interface RateLimiter {
  check(key: string): Promise<RateLimitResult>;
}

export interface MemoryRateLimiterOptions {
  limit: number;
  windowMs: number;
  /** Máximo de claves retenidas; evita crecimiento sin límite ante ataques. */
  maxKeys?: number;
}

export function createMemoryRateLimiter({
  limit,
  windowMs,
  maxKeys = 10_000,
}: MemoryRateLimiterOptions): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    async check(key: string): Promise<RateLimitResult> {
      const now = Date.now();
      const windowStart = now - windowMs;

      const timestamps = (hits.get(key) ?? []).filter((time) => time > windowStart);

      if (timestamps.length >= limit) {
        const retryAfter = Math.ceil((timestamps[0] + windowMs - now) / 1000);
        hits.set(key, timestamps);
        return { ok: false, remaining: 0, retryAfter: Math.max(retryAfter, 1) };
      }

      timestamps.push(now);
      hits.set(key, timestamps);

      if (hits.size > maxKeys) {
        for (const [candidate, times] of hits) {
          if (times.every((time) => time <= windowStart)) hits.delete(candidate);
          if (hits.size <= maxKeys) break;
        }
      }

      return { ok: true, remaining: limit - timestamps.length, retryAfter: 0 };
    },
  };
}

/** Mejor aproximación a la IP del cliente detrás de proxies/CDN. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? headers.get("cf-connecting-ip") ?? "unknown";
}
