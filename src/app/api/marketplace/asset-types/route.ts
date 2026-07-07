import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// GET  /api/marketplace/asset-types  → list public asset types with counts
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const assetTypes = await prisma.assetType.findMany({
      where: { is_public: true },
      select: {
        slug: true,
        name: true,
        icon: true,
        description: true,
        division: true,
        _count: {
          select: {
            assets: { where: { status: "published" } },
          },
        },
      },
      orderBy: { sort_order: "asc" },
    });

    const result = assetTypes.map((at) => ({
      slug: at.slug,
      name: at.name,
      icon: at.icon,
      description: at.description,
      division: at.division,
      _count: { assets: at._count.assets },
    }));

    logger.info("Marketplace asset types listed", { count: result.length });

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Failed to list marketplace asset types", { error: String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
