import { NextRequest, NextResponse } from "next/server";
import { syncSku } from "@/lib/erp-client";
import { isValidApiKey } from "@/lib/auth";
import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// POST /api/internal/sku-sync  → forward SKU data to the ERP
// ---------------------------------------------------------------------------
// This endpoint is called when rea3assets needs to sync an asset's SKU
// to the core ERP. It delegates to erp-client.ts which handles the
// actual HTTP call to the ERP's internal API.
//
// Also serves as an inbound endpoint if the ERP calls US to sync back,
// but the primary direction is rea3assets → ERP for SKU creation/update.
//
// Auth: Bearer token validated against ERP_INTERNAL_API_KEY.
//       If ERP_INTERNAL_API_KEY is not configured, auth is disabled.

export async function POST(request: NextRequest) {
  // ── Auth: validate Bearer token ───────────────────────────────────────
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized — Bearer token required" },
      { status: 401 },
    );
  }
  const token = authHeader.slice(7);
  if (!isValidApiKey(token)) {
    return NextResponse.json(
      { error: "Unauthorized — invalid API key" },
      { status: 401 },
    );
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json() as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const sku = body.sku as string;
    const name = body.name as string;
    if (!sku || !name) {
      return NextResponse.json(
        { error: "sku and name are required" },
        { status: 400 },
      );
    }

    const result = await syncSku({
      sku,
      name,
      division: (body.division as string) ?? "vault_product",
      family: (body.family as string) ?? "default",
      pillar: (body.pillar as string) ?? "I",
      license_model: (body.license_model as string) ?? "na",
      gateway: (body.gateway as string) ?? "manual",
      currency: (body.currency as string) ?? "USD",
      description: (body.description as string | null | undefined) ?? null,
      asset_type_name: (body.asset_type_name as string) ?? "Unknown",
      metadata: body.metadata as Record<string, unknown> | undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, sku: body.sku });
  } catch (error) {
    logger.error("Internal SKU sync failed", { error: String(error) });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
