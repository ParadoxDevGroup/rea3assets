// ---------------------------------------------------------------------------
// Edge-Safe Auth Primitives
// ---------------------------------------------------------------------------
// HMAC-SHA256 token signing and verification.
// Pure functions — NO next/headers dependency.
// Safe to import from middleware (Edge Runtime).
//
// Usage in middleware:
//   import { verifyToken } from "@/lib/auth-edge";
//   const payload = await verifyToken(token);

/**
 * Derive a secret key for HMAC from the admin password.
 * If no password is configured, returns null (auth is disabled).
 */
function getSecret(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || pw.length < 4) return null;
  return pw;
}

/**
 * Sign a payload with HMAC-SHA256.
 * Returns `${payload}.${hexSignature}`.
 */
export async function signToken(payload: string): Promise<string> {
  const secret = getSecret();
  if (!secret) return payload;
  return hmacSign(secret, payload);
}

/**
 * Verify an HMAC-signed token and return the original payload,
 * or null if invalid.
 */
export async function verifyToken(signed: string): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return signed;
  return hmacVerify(secret, signed);
}

// ---------------------------------------------------------------------------
// HMAC primitives (pure, no next/headers, uses Web Crypto API)
// ---------------------------------------------------------------------------

async function hmacSign(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${payload}.${hex}`;
}

async function hmacVerify(secret: string, signed: string): Promise<string | null> {
  const lastDot = signed.lastIndexOf(".");
  if (lastDot === -1) return null;
  const payload = signed.slice(0, lastDot);
  const sig = signed.slice(lastDot + 1);
  const expected = await hmacSign(secret, payload);
  const expectedSig = expected.slice(lastDot + 1);
  if (sig.length !== expectedSig.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) {
    diff |= sig.charCodeAt(i) ^ expectedSig.charCodeAt(i);
  }
  return diff === 0 ? payload : null;
}

/**
 * Verify a bearer token for API-to-API calls.
 * Checks against ERP_INTERNAL_API_KEY using constant-time comparison.
 */
export function isValidApiKey(token: string | null): boolean {
  if (!token) return false;
  const expected = process.env.ERP_INTERNAL_API_KEY;
  if (!expected) return false;
  const maxLen = Math.max(token.length, expected.length);
  let diff = 0;
  for (let i = 0; i < maxLen; i++) {
    const a = i < token.length ? token.charCodeAt(i) : 0;
    const b = i < expected.length ? expected.charCodeAt(i) : 0;
    diff |= a ^ b;
  }
  return diff === 0;
}
