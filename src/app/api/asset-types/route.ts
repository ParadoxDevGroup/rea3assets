import { NextRequest, NextResponse } from "next/server";
import { prisma, isPrismaConflict } from "@/lib/prisma";
import { createAssetTypeSchema } from "@/lib/validations/asset-types";
import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// GET  /api/asset-types  → list all asset types with their fields
// POST /api/asset-types  → create a new asset type
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const types = await prisma.assetType.findMany({
      include: {
        fields: { orderBy: { sort_order: "asc" } },
        _count: { select: { assets: true } },
      },
      orderBy: { sort_order: "asc" },
    });
    return NextResponse.json(types);
  } catch (error) {
    logger.error("Failed to list asset types", { error: String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const parsed = createAssetTypeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    // Block slugs that would conflict with app routes
    const RESERVED_SLUGS = [
      "login", "logout", "api", "admin", "marketplace",
      "assets", "asset-types", "pipelines", "tags", "tag-groups",
      "settings", "upload", "dashboard", "checkout", "health",
    ];
    if (RESERVED_SLUGS.includes(parsed.data.slug)) {
      return NextResponse.json(
        { error: `Slug '${parsed.data.slug}' is reserved and cannot be used as an asset type` },
        { status: 400 },
      );
    }

    const type = await prisma.assetType.create({ data: parsed.data });
    logger.info("Asset type created", { slug: type.slug, name: type.name });
    return NextResponse.json(type, { status: 201 });
  } catch (error) {
    if (isPrismaConflict(error)) {
      return NextResponse.json(
        { error: "An asset type with this slug already exists" },
        { status: 409 },
      );
    }
    logger.error("Failed to create asset type", { error: String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
