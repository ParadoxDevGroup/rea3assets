import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createFieldSchema } from "@/lib/validations/asset-types";
import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// GET  /api/asset-types/[slug]/fields  → list fields for an asset type
// POST /api/asset-types/[slug]/fields  → add a new field to an asset type
// ---------------------------------------------------------------------------

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;

    const assetType = await prisma.assetType.findUnique({ where: { slug } });
    if (!assetType) {
      return NextResponse.json({ error: "Asset type not found" }, { status: 404 });
    }

    const fields = await prisma.assetTypeField.findMany({
      where: { asset_type_id: assetType.id },
      orderBy: { sort_order: "asc" },
    });

    return NextResponse.json(fields);
  } catch (error) {
    logger.error("Failed to list fields", { error: String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;

    const assetType = await prisma.assetType.findUnique({ where: { slug } });
    if (!assetType) {
      return NextResponse.json({ error: "Asset type not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = createFieldSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    // Auto-assign sort_order to end if not provided
    if (!body.sort_order) {
      const max = await prisma.assetTypeField.aggregate({
        where: { asset_type_id: assetType.id },
        _max: { sort_order: true },
      });
      parsed.data.sort_order = (max._max.sort_order ?? -1) + 1;
    }

    const field = await prisma.assetTypeField.create({
      data: {
        ...parsed.data,
        asset_type_id: assetType.id,
      },
    });

    logger.info("Field created", { assetType: slug, field: field.slug });
    return NextResponse.json(field, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "A field with this slug already exists on this asset type" },
        { status: 409 },
      );
    }
    logger.error("Failed to create field", { error: String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
