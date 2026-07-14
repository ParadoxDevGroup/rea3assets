// ---------------------------------------------------------------------------
// Auth Helpers
// ---------------------------------------------------------------------------
// Simple cookie-based auth for the admin UI.
// Uses ADMIN_PASSWORD env var and HMAC-signed tokens.
// No database needed — session is self-contained in the cookie.
//
// Two tiers:
//   - Edge-safe: verifyToken(tokenString) — pure function, no next/headers
//   - Server-only: createSession(), destroySession() — use next/headers

import { cookies } from "next/headers";

// Re-export edge-safe functions (no next/headers dependency) so existing
// imports from @/lib/auth continue to work. Middleware imports directly
// from @/lib/auth-edge to avoid pulling next/headers into Edge Runtime.
export { signToken, verifyToken, isValidApiKey } from "./auth-edge";

const SESSION_COOKIE = "rea3_session";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

// ---------------------------------------------------------------------------
// HMAC primitives (delegated to auth-edge for edge-safe usage)
// ---------------------------------------------------------------------------

import { signToken, verifyToken } from "./auth-edge";

/** Sign a payload with HMAC-SHA256 using the admin password as key. (legacy — prefer signToken) */
async function sign(payload: string): Promise<string> {
  return signToken(payload);
}

/**
 * Verify an HMAC-signed payload. Returns the original payload if valid, null otherwise. (legacy — prefer verifyToken)
 */
async function verify(signed: string): Promise<string | null> {
  return verifyToken(signed);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check if a session cookie is valid.
 * Returns true if the user is authenticated.
 */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const result = await verify(token);
  return result !== null;
}

/**
 * Create a session cookie and set it on the response.
 * Calls `set` on the cookie store (must be called from a Server Action or Route Handler).
 */
export async function createSession(): Promise<void> {
  const store = await cookies();
  const token = await sign(`rea3_session_${Date.now()}`);
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
}

/**
 * Destroy the session cookie.
 */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

// isValidApiKey is re-exported from auth-edge above
