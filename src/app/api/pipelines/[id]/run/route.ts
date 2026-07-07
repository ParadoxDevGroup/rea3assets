import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { runPipeline } from "@/lib/pipeline/runner";

// ---------------------------------------------------------------------------
// POST /api/pipelines/[id]/run  → trigger a pipeline run for a specific asset version
// ---------------------------------------------------------------------------

interface RouteContext {
  params: Promise<{ id: string }>;
}

const runPipelineSchema = z.object({
  asset_version_id: z.string().uuid(),
});

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const body = await request.json();
    const parsed = runPipelineSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { asset_version_id } = parsed.data;

    // Verify pipeline exists
    const pipeline = await prisma.pipelineConfig.findUnique({
      where: { id },
      include: { steps: { orderBy: { sort_order: "asc" } } },
    });

    if (!pipeline) {
      return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });
    }

    if (pipeline.steps.length === 0) {
      return NextResponse.json(
        { error: "Pipeline has no steps configured" },
        { status: 400 },
      );
    }

    // Verify asset version exists
    const assetVersion = await prisma.assetVersion.findUnique({
      where: { id: asset_version_id },
    });

    if (!assetVersion) {
      return NextResponse.json({ error: "Asset version not found" }, { status: 404 });
    }

    // Create PipelineRun record
    const run = await prisma.pipelineRun.create({
      data: {
        asset_version_id,
        pipeline_id: id,
        status: "pending",
      },
    });

    // Create PipelineStepResult for each step
    await prisma.pipelineStepResult.createMany({
      data: pipeline.steps.map((step) => ({
        run_id: run.id,
        processor: step.processor,
        status: "pending",
      })),
    });

    logger.info("Pipeline run created, starting background execution", {
      runId: run.id,
      pipelineId: id,
      assetVersionId: asset_version_id,
      stepCount: pipeline.steps.length,
    });

    // Fire-and-forget — do NOT await
    runPipeline(run.id).catch((err) => {
      logger.error("Background pipeline run failed fatally", {
        runId: run.id,
        error: String(err),
      });
    });

    return NextResponse.json({ run_id: run.id }, { status: 202 });
  } catch (error) {
    logger.error("Failed to create pipeline run", { error: String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
