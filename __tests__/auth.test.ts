import { describe, it, expect, beforeEach, afterEach, afterAll } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { proxy as middleware } from "@/proxy";
import { signToken, verifyToken, isValidApiKey } from "@/lib/auth-edge";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(
  pathname: string,
  opts?: {
    cookies?: Record<string, string>;
    origin?: string;
  },
): NextRequest {
  const origin = opts?.origin ?? "http://localhost:3000";
  const url = new URL(pathname, origin);
  const request = new NextRequest(url);
  if (opts?.cookies) {
    for (const [k, v] of Object.entries(opts.cookies)) {
      request.cookies.set(k, v);
    }
  }
  return request;
}

async function expectNext(response: NextResponse): Promise<void> {
  // NextResponse.next() has status 200 and no body
  expect(response.status).toBe(200);
}

async function expect401Json(response: NextResponse): Promise<void> {
  expect(response.status).toBe(401);
  const body = await response.json();
  expect(body.error).toContain("Unauthorized");
}

async function expectRedirect(response: NextResponse, pathContains: string): Promise<void> {
  expect(response.status).toBe(307);
  const location = response.headers.get("Location");
  expect(location).toContain(pathContains);
}

// ---------------------------------------------------------------------------
// Auth Middleware Tests
// ---------------------------------------------------------------------------

describe("Auth Middleware", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Set a password so auth is active during tests
    process.env.ADMIN_PASSWORD = "test-password-123";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = { ...originalEnv };
  });

  // -----------------------------------------------------------------------
  // Public routes
  // -----------------------------------------------------------------------

  it("allows public marketplace API routes", async () => {
    const res = await middleware(makeRequest("/api/marketplace/assets"));
    await expectNext(res);
  });

  it("allows public auth API routes", async () => {
    const res = await middleware(makeRequest("/api/auth/login"));
    await expectNext(res);

    const res2 = await middleware(makeRequest("/api/auth/logout"));
    await expectNext(res2);
  });

  it("allows file serving routes", async () => {
    const res = await middleware(makeRequest("/api/files/ab/uuid.png"));
    await expectNext(res);
  });

  it("allows internal sku-sync (protected by API key in route)", async () => {
    const res = await middleware(makeRequest("/api/internal/sku-sync"));
    await expectNext(res);
  });

  it("allows marketplace pages", async () => {
    const res = await middleware(makeRequest("/marketplace"));
    await expectNext(res);

    const res2 = await middleware(makeRequest("/marketplace/some-asset"));
    await expectNext(res2);
  });

  it("allows login page", async () => {
    const res = await middleware(makeRequest("/login"));
    await expectNext(res);
  });

  // -----------------------------------------------------------------------
  // Protected admin API routes
  // -----------------------------------------------------------------------

  it("returns 401 for admin API routes without session", async () => {
    const res = await middleware(makeRequest("/api/assets"));
    await expect401Json(res);
  });

  it("returns 401 for nested admin API routes without session", async () => {
    const res = await middleware(makeRequest("/api/assets/some-id"));
    await expect401Json(res);

    const res2 = await middleware(makeRequest("/api/pipelines"));
    await expect401Json(res2);

    const res3 = await middleware(makeRequest("/api/asset-types/some-slug"));
    await expect401Json(res3);
  });

  it("returns 401 for settings API without session", async () => {
    const res = await middleware(makeRequest("/api/settings/erp-config"));
    await expect401Json(res);

    const res2 = await middleware(makeRequest("/api/settings/status"));
    await expect401Json(res2);
  });

  // -----------------------------------------------------------------------
  // Protected admin pages
  // -----------------------------------------------------------------------

  it("redirects admin pages to /login without session", async () => {
    const res = await middleware(makeRequest("/"));
    await expectRedirect(res, "/login");
  });

  it("includes redirect param in login URL", async () => {
    const res = await middleware(makeRequest("/assets"));
    expect(res.status).toBe(307);
    const location = res.headers.get("Location");
    expect(location).toContain("/login");
    expect(location).toContain("redirect=");
  });

  it("redirects nested admin pages", async () => {
    const res = await middleware(makeRequest("/pipelines/some-id"));
    await expectRedirect(res, "/login");
  });

  // -----------------------------------------------------------------------
  // Valid session
  // -----------------------------------------------------------------------

  it("allows admin API routes with valid session token", async () => {
    const token = await signToken("session-payload");
    const res = await middleware(
      makeRequest("/api/assets", {
        cookies: { rea3_session: token },
      }),
    );
    await expectNext(res);
  });

  it("allows admin pages with valid session token", async () => {
    const token = await signToken("session-payload");
    const res = await middleware(
      makeRequest("/assets", {
        cookies: { rea3_session: token },
      }),
    );
    await expectNext(res);
  });

  it("rejects tampered session token", async () => {
    const token = await signToken("session-payload");
    const tampered = token + "x"; // append a character
    const res = await middleware(
      makeRequest("/api/assets", {
        cookies: { rea3_session: tampered },
      }),
    );
    await expect401Json(res);
  });

  // -----------------------------------------------------------------------
  // Dev mode (no password)
  // -----------------------------------------------------------------------

  it("allows all access in dev mode with no ADMIN_PASSWORD", async () => {
    delete process.env.ADMIN_PASSWORD;
    (process.env as Record<string, string>).NODE_ENV = "development";

    const res = await middleware(makeRequest("/api/assets"));
    await expectNext(res);

    const res2 = await middleware(makeRequest("/"));
    await expectNext(res2);

    const res3 = await middleware(makeRequest("/pipelines"));
    await expectNext(res3);
  });

  it("blocks access in production with no ADMIN_PASSWORD", async () => {
    delete process.env.ADMIN_PASSWORD;
    (process.env as Record<string, string>).NODE_ENV = "production";

    const res = await middleware(makeRequest("/api/assets"));
    await expect401Json(res);
  });
});

// ---------------------------------------------------------------------------
// Edge-Safe Token Tests
// ---------------------------------------------------------------------------

describe("Auth Edge Tokens (signToken / verifyToken)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.ADMIN_PASSWORD = "test-password-abc-123";
    process.env.ERP_INTERNAL_API_KEY = "sk-erp-secret-key-12345";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = { ...originalEnv };
  });

  // -----------------------------------------------------------------------
  // signToken / verifyToken
  // -----------------------------------------------------------------------

  it("round-trips: sign then verify returns original payload", async () => {
    const payload = "rea3_session_1234567890";
    const signed = await signToken(payload);
    expect(signed).not.toBe(payload);
    expect(signed).toContain(payload);
    expect(signed).toContain(".");

    const verified = await verifyToken(signed);
    expect(verified).toBe(payload);
  });

  it("verifyToken returns null for tampered token", async () => {
    const signed = await signToken("original");
    const tampered = signed.slice(0, -4) + "xxxx";
    const verified = await verifyToken(tampered);
    expect(verified).toBeNull();
  });

  it("verifyToken returns null for token without dot", async () => {
    const verified = await verifyToken("no-dot-just-string");
    expect(verified).toBeNull();
  });

  it("verifyToken returns null for empty string", async () => {
    const verified = await verifyToken("");
    expect(verified).toBeNull();
  });

  it("different payloads produce different signatures", async () => {
    const s1 = await signToken("payload-a");
    const s2 = await signToken("payload-b");
    expect(s1).not.toBe(s2);
  });

  it("returns raw payload when no password is set", async () => {
    delete process.env.ADMIN_PASSWORD;
    const signed = await signToken("dev-mode");
    expect(signed).toBe("dev-mode"); // no-op

    const verified = await verifyToken("any-value");
    expect(verified).toBe("any-value"); // no-op
  });

  // -----------------------------------------------------------------------
  // isValidApiKey
  // -----------------------------------------------------------------------

  it("returns true for matching API key", () => {
    expect(isValidApiKey("sk-erp-secret-key-12345")).toBe(true);
  });

  it("returns false for non-matching API key", () => {
    expect(isValidApiKey("wrong-key")).toBe(false);
  });

  it("returns false for null token", () => {
    expect(isValidApiKey(null)).toBe(false);
  });

  it("returns false when ERP_INTERNAL_API_KEY is not configured", () => {
    delete process.env.ERP_INTERNAL_API_KEY;
    expect(isValidApiKey("any-key")).toBe(false);
  });

  it("is case-sensitive", () => {
    expect(isValidApiKey("SK-ERP-SECRET-KEY-12345")).toBe(false);
  });

  it("rejects empty string token", () => {
    expect(isValidApiKey("")).toBe(false);
  });
});
