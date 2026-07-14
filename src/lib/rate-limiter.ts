// ---------------------------------------------------------------------------
// In-memory Rate Limiter
// ---------------------------------------------------------------------------
// Lightweight per-IP sliding-window rate limiter.
// Resets on server restart. Suitable for single-instance deployments.
// For multi-instance, replace with Redis-backed implementation.

interface RateEntry {
  count: number;
  until: number;
}

const stores = new Map<string, Map<string, RateEntry>>();

/**
 * Returns the bucket name for a given IP. Falls back to "unknown"
 * if no identifying header is present.
 */
function resolveIp(request: Request): string {
  const headers = request.headers;
  const raw = (headers.get("x-forwarded-for") ?? headers.get("x-real-ip") ?? "").split(",")[0]!.trim();
  return raw || "unknown";
}

/**
 * Check whether a request is rate-limited.
 *
 * @param request  Incoming HTTP request (used to extract client IP).
 * @param key      Logical bucket (e.g. "upload", "asset:create").
 * @param max      Max requests allowed in the window.
 * @param windowMs Sliding window duration in milliseconds.
 * @returns true if the request is rate-limited.
 */
export function isRateLimited(
  request: Request,
  key: string,
  max: number,
): boolean {
  const ip = resolveIp(request);
  let store = stores.get(key);
  if (!store) {
    store = new Map();
    stores.set(key, store);
  }

  // Cleanup expired entries on every lookup (amortized)
  const now = Date.now();
  for (const [k, e] of store) {
    if (now > e.until) store.delete(k);
  }

  const entry = store.get(ip);
  if (!entry) return false;

  if (now > entry.until) {
    store.delete(ip);
    return false;
  }

  return entry.count >= max;
}

/**
 * Record a request for rate-limiting purposes.
 *
 * @param request  Incoming HTTP request (used to extract client IP).
 * @param key      Logical bucket (e.g. "upload", "asset:create").
 * @param windowMs Sliding window duration in milliseconds.
 */
export function recordAttempt(
  request: Request,
  key: string,
  windowMs: number,
): void {
  const ip = resolveIp(request);
  let store = stores.get(key);
  if (!store) {
    store = new Map();
    stores.set(key, store);
  }

  const entry = store.get(ip);
  if (!entry || Date.now() > entry.until) {
    store.set(ip, { count: 1, until: Date.now() + windowMs });
  } else {
    entry.count++;
  }
}
