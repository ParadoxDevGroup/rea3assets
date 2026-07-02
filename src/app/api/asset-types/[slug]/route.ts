import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateAssetTypeSchema } from "@/lib/validations/asset-types";
import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// GET    /api/asset-types/[slug]  → get one asset type with fields + asset count
// PATCH  /api/asset-types/[slug]  → update an asset type
// DELETE /api/asset-types/[slug]  → delete an asset type (cascade fields)
// ---------------------------------------------------------------------------

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const type = await prisma.assetType.findUnique({
      where: { slug },
      include: {
        fields: { orderBy: { sort_order: "asc" } },
        _count: { select: { assets: true } },
      },
    });

    if (!type) {
      return NextResponse.json({ error: "Asset type not found" }, { status: 404 });
    }

    return NextResponse.json(type);
  } catch (error) {
    logger.error("Failed to get asset type", { error: String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const parsed = updateAssetTypeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const existing = await prisma.assetType.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: "Asset type not found" }, { status: 404 });
    }

    const type = await prisma.assetType.update({
      where: { slug },
      data: parsed.data,
    });

    logger.info("Asset type updated", { slug });
    return NextResponse.json(type);
  } catch (error) {
    logger.error("Failed to update asset type", { error: String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;

    const existing = await prisma.assetType.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: "Asset type not found" }, { status: 404 });
    }

    // Cascade: delete fields, then the type itself
    await prisma.assetTypeField.deleteMany({ where: { asset_type_id: existing.id } });
    await prisma.assetType.delete({ where: { slug } });

    logger.info("Asset type deleted", { slug });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete asset type", { error: String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
