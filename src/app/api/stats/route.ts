import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

// GET /api/stats - aggregated counts for admin dashboard
export async function GET() {
  try {
    const [assetTypes, totals] = await Promise.all([
      prisma.assetType.count(),
      prisma.asset.groupBy({ by: ["status"], _count: { id: true } }),
    ]);
    const totalAssets = totals.reduce((sum, t) => sum + t._count.id, 0);
    const byStatus = Object.fromEntries(totals.map((t) => [t.status, t._count.id]));
    return NextResponse.json({
      assetTypes,
      totalAssets,
      published: byStatus.published ?? 0,
      inReview: byStatus.in_review ?? 0,
      draft: byStatus.draft ?? 0,
      approved: byStatus.approved ?? 0,
      deprecated: byStatus.deprecated ?? 0,
      archived: byStatus.archived ?? 0,
    });
  } catch (error) {
    logger.error("Failed to load stats", { error: String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
