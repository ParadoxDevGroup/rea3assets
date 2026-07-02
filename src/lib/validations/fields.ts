import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Field Config Schemas
// ---------------------------------------------------------------------------
// Each entry defines the Zod schema for a field_type's `config` JSON column.
// These are composable: the FieldBuilder UI reads these schemas to render
// the correct config form for each field type.

export const fieldConfigSchemas = {
  select: z.object({ options: z.array(z.string()).min(1) }),
  multi_select: z.object({ options: z.array(z.string()).min(1) }),
  number: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
    unit: z.string().optional(),
  }).optional(),
  image: z.object({
    max_size_mb: z.number().optional(),
    accepted_formats: z.array(z.string()).optional(),
  }).optional(),
  file: z.object({
    max_size_mb: z.number().optional(),
    accepted_formats: z.array(z.string()).optional(),
  }).optional(),
  tags: z.object({
    max_tags: z.number().optional(),
  }).optional(),
  rating: z.object({
    max: z.number().default(5),
  }).optional(),
} as const;

export type FieldConfig = z.infer<typeof fieldConfigSchemas.select>;
