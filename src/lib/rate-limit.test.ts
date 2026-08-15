import { describe, expect, it, vi } from "vitest";

import { clientIp, createMemoryRateLimiter } from "./rate-limit";

describe("createMemoryRateLimiter", () => {
  it("permite hasta el límite y luego bloquea", async () => {
    const limiter = createMemoryRateLimiter({ limit: 2, windowMs: 60_000 });

    expect((await limiter.check("ip")).ok).toBe(true);
    expect((await limiter.check("ip")).ok).toBe(true);

    const blocked = await limiter.check("ip");
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("aísla las claves entre sí", async () => {
    const limiter = createMemoryRateLimiter({ limit: 1, windowMs: 60_000 });

    expect((await limiter.check("a")).ok).toBe(true);
    expect((await limiter.check("b")).ok).toBe(true);
    expect((await limiter.check("a")).ok).toBe(false);
  });

  it("libera cupos al vencer la ventana", async () => {
    vi.useFakeTimers();
    try {
      const limiter = createMemoryRateLimiter({ limit: 1, windowMs: 1_000 });

      expect((await limiter.check("ip")).ok).toBe(true);
      expect((await limiter.check("ip")).ok).toBe(false);

      vi.advanceTimersByTime(1_500);
      expect((await limiter.check("ip")).ok).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("clientIp", () => {
  it("usa la primera IP de x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.7, 70.41.3.18" });
    expect(clientIp(headers)).toBe("203.0.113.7");
  });

  it("cae a unknown sin cabeceras de proxy", () => {
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
