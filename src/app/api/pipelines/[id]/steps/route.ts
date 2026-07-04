import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createStepSchema, KNOWN_PROCESSORS } from "@/lib/validations/pipelines";
import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// GET  /api/pipelines/[id]/steps  → list steps for a pipeline
// POST /api/pipelines/[id]/steps  → add a step to a pipeline
// ---------------------------------------------------------------------------

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const pipeline = await prisma.pipelineConfig.findUnique({ where: { id } });
    if (!pipeline) {
      return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });
    }
    const steps = await prisma.pipelineStep.findMany({
      where: { pipeline_id: id },
      orderBy: { sort_order: "asc" },
    });
    return NextResponse.json(steps);
  } catch (error) {
    logger.error("Failed to list steps", { error: String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const pipeline = await prisma.pipelineConfig.findUnique({ where: { id } });
    if (!pipeline) {
      return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = createStepSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    // Validate processor against known list
    const known = KNOWN_PROCESSORS.find((p) => p.id === parsed.data.processor);
    if (!known) {
      return NextResponse.json(
        { error: `Unknown processor '${parsed.data.processor}'. Known: ${KNOWN_PROCESSORS.map((p) => p.id).join(", ")}` },
        { status: 400 },
      );
    }

    // Auto-assign sort_order
    if (body.sort_order === undefined) {
      const max = await prisma.pipelineStep.aggregate({
        where: { pipeline_id: id },
        _max: { sort_order: true },
      });
      parsed.data.sort_order = (max._max.sort_order ?? -1) + 1;
    }

    const step = await prisma.pipelineStep.create({
      data: {
        ...parsed.data,
        pipeline_id: id,
      },
    });

    logger.info("Pipeline step created", { pipelineId: id, processor: step.processor });
    return NextResponse.json(step, { status: 201 });
  } catch (error) {
    logger.error("Failed to create step", { error: String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
