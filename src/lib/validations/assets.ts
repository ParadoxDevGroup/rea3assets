import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Asset Validation Schemas
// ---------------------------------------------------------------------------

export const createAssetSchema = z.object({
  asset_type_slug: z.string(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.any()).default({}),
});

export const updateAssetSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  status: z
    .enum(["draft", "in_review", "approved", "published", "deprecated", "archived"])
    .optional(),
});
