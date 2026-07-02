import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateFieldSchema } from "@/lib/validations/asset-types";
import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// PATCH  /api/asset-types/[slug]/fields/[fieldSlug]  → update a field
// DELETE /api/asset-types/[slug]/fields/[fieldSlug]  → delete a field
// ---------------------------------------------------------------------------

interface RouteContext {
  params: Promise<{ slug: string; fieldSlug: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug, fieldSlug } = await params;

    const assetType = await prisma.assetType.findUnique({ where: { slug } });
    if (!assetType) {
      return NextResponse.json({ error: "Asset type not found" }, { status: 404 });
    }

    // Find the field by its composite unique (asset_type_id, slug)
    const existing = await prisma.assetTypeField.findFirst({
      where: { asset_type_id: assetType.id, slug: fieldSlug },
    });
    if (!existing) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateFieldSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const field = await prisma.assetTypeField.update({
      where: { id: existing.id },
      data: parsed.data,
    });

    logger.info("Field updated", { assetType: slug, field: fieldSlug });
    return NextResponse.json(field);
  } catch (error) {
    logger.error("Failed to update field", { error: String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { slug, fieldSlug } = await params;

    const assetType = await prisma.assetType.findUnique({ where: { slug } });
    if (!assetType) {
      return NextResponse.json({ error: "Asset type not found" }, { status: 404 });
    }

    const existing = await prisma.assetTypeField.findFirst({
      where: { asset_type_id: assetType.id, slug: fieldSlug },
    });
    if (!existing) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 });
    }

    await prisma.assetTypeField.delete({ where: { id: existing.id } });

    logger.info("Field deleted", { assetType: slug, field: fieldSlug });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete field", { error: String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
