import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Pipeline Config Schemas
// ---------------------------------------------------------------------------

export const createPipelineSchema = z.object({
  name: z.string().min(1).max(100),
  is_default: z.boolean().default(false),
});

export const updatePipelineSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  is_default: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Pipeline Step Schemas
// ---------------------------------------------------------------------------

export const createStepSchema = z.object({
  processor: z.string().min(1),
  config: z.any().optional(),
  sort_order: z.number().int().default(0),
  on_failure: z.enum(["stop", "skip", "warn"]).default("stop"),
});

export const updateStepSchema = z.object({
  processor: z.string().min(1).optional(),
  config: z.any().nullable().optional(),
  sort_order: z.number().int().optional(),
  on_failure: z.enum(["stop", "skip", "warn"]).optional(),
});

// ---------------------------------------------------------------------------
// Known Processors
// ---------------------------------------------------------------------------

export const KNOWN_PROCESSORS = [
  { id: "thumbnail", label: "Generate Thumbnails", description: "Auto-generate gallery/cover thumbnails from uploaded file." },
  { id: "validate-format", label: "Validate Format", description: "Check file format against accepted types." },
  { id: "optimize-mesh", label: "Optimize Mesh", description: "Reduce polygon count for real-time performance." },
  { id: "virus-scan", label: "Virus Scan", description: "Scan uploaded file for malware." },
  { id: "generate-description", label: "Generate Description", description: "AI-powered description and metadata enrichment." },
  { id: "watermark", label: "Apply Watermark", description: "Overlay preview watermark on marketplace assets." },
] as const;
