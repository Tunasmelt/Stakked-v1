/**
 * Lightweight in-memory rate limiter for Next.js API routes.
 *
 * Uses a sliding-window token-bucket per IP address. Because Next.js
 * server processes may be restarted on Vercel between requests, this
 * provides best-effort protection — not a hard guarantee. For production
 * at scale, replace the Map with an Upstash Redis store.
 *
 * Usage:
 *   const result = rateLimit(request, { limit: 10, windowMs: 60_000 });
 *   if (!result.ok) return result.response; // 429 Too Many Requests
 */

interface RateLimitOptions {
  /** Maximum requests allowed within the window. */
  limit: number;
  /** Rolling window length in milliseconds. */
  windowMs: number;
}

interface RateLimitResult {
  ok: true;
  remaining: number;
  response?: never;
}

interface RateLimitBlocked {
  ok: false;
  remaining: 0;
  response: Response;
}

type RateLimitReturn = RateLimitResult | RateLimitBlocked;

interface WindowEntry {
  timestamps: number[];
}

// Module-level store — survives across requests within the same Node process.
const store = new Map<string, WindowEntry>();

// Prune stale entries every 5 minutes so memory doesn't grow indefinitely.
let lastPrune = Date.now();
function maybePrune(windowMs: number) {
  const now = Date.now();
  if (now - lastPrune < 300_000) return;
  lastPrune = now;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

function getIp(request: Request): string {
  // Next.js / Vercel forwards the real IP in these headers.
  const headers = new Headers((request as Request & { headers: Headers }).headers);
  return (
    headers.get('x-real-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

export function rateLimit(
  request: Request,
  options: RateLimitOptions,
): RateLimitReturn {
  const { limit, windowMs } = options;
  const ip = getIp(request);
  const now = Date.now();
  const key = ip;

  maybePrune(windowMs);

  const entry = store.get(key) ?? { timestamps: [] };
  // Slide the window: drop timestamps outside the current window.
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    store.set(key, entry);
    const retryAfter = Math.ceil(windowMs / 1000);
    return {
      ok: false,
      remaining: 0,
      response: new Response(
        JSON.stringify({ error: 'Too many requests. Please wait before trying again.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil((now + windowMs) / 1000)),
          },
        },
      ),
    };
  }

  entry.timestamps.push(now);
  store.set(key, entry);
  const remaining = limit - entry.timestamps.length;

  return { ok: true, remaining };
}
