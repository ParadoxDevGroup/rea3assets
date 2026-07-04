import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// POST /api/internal/sku-sync
//
// Stub endpoint for the SKU sync contract.
// The ERP calls this (or this calls the ERP — direction depends on deployment).
// For now, logs the payload and returns success so integration testing works.
// Replace with real implementation when the ERP side is ready.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    logger.info("Internal SKU sync received", { payload: body });

    // TODO: upsert ProductSKU in the local rea3_assets DB if needed,
    // or forward to the ERP. This stub just acknowledges receipt.

    return NextResponse.json({
      success: true,
      message: "SKU sync acknowledged (stub)",
      sku: body.sku,
    });
  } catch (error) {
    logger.error("Internal SKU sync failed", { error: String(error) });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
