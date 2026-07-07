import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { serializeBigInts } from "@/lib/serialize";

// ---------------------------------------------------------------------------
// GET  /api/marketplace/assets/[slug]  → single public published asset detail
// ---------------------------------------------------------------------------

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;

    const asset = await prisma.asset.findUnique({
      where: { slug },
      include: {
        asset_type: {
          include: {
            fields: {
              orderBy: { sort_order: "asc" },
              select: { slug: true, label: true, field_type: true, placeholder: true },
            },
          },
        },
        thumbnails: {
          orderBy: { sort_order: "asc" },
          select: {
            id: true,
            url: true,
            purpose: true,
            width: true,
            height: true,
            format: true,
          },
        },
        versions: {
          orderBy: { created_at: "desc" },
          select: {
            id: true,
            version: true,
            changelog: true,
            created_at: true,
            file_size: true,
            format: true,
          },
        },
        tags: {
          include: {
            tag: {
              include: { group: { select: { name: true } } },
            },
          },
        },
        dependencies: {
          include: {
            dependency: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    // Enforce public visibility: asset must exist, be published, and belong to a public asset type
    if (!asset || !asset.asset_type.is_public || asset.status !== "published") {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    logger.info("Marketplace asset detail retrieved", { slug });

    return NextResponse.json(serializeBigInts(asset));
  } catch (error) {
    logger.error("Failed to get marketplace asset", { error: String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
