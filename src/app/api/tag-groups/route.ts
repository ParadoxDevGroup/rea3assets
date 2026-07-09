import { NextRequest, NextResponse } from "next/server";
import { prisma, isPrismaConflict } from "@/lib/prisma";
import { createTagGroupSchema } from "@/lib/validations/tags";
import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// GET  /api/tag-groups  → list all tag groups with tags
// POST /api/tag-groups  → create a new tag group
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const groups = await prisma.tagGroup.findMany({
      include: { tags: { orderBy: { name: "asc" } } },
      orderBy: { sort_order: "asc" },
    });
    return NextResponse.json(groups);
  } catch (error) {
    logger.error("Failed to list tag groups", { error: String(error) });
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
    const parsed = createTagGroupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }
    const group = await prisma.tagGroup.create({ data: parsed.data });
    logger.info("Tag group created", { slug: group.slug, name: group.name });
    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    if (isPrismaConflict(error)) {
      return NextResponse.json({ error: "A tag group with this slug already exists" }, { status: 409 });
    }
    logger.error("Failed to create tag group", { error: String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
