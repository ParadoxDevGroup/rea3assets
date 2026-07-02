import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Asset Type Validation Schemas
// ---------------------------------------------------------------------------

export const createAssetTypeSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  icon: z.string().optional(),
  division: z.enum(["vault_product", "vault_service", "shop_product", "shop_service", "community"]),
  is_internal: z.boolean().default(true),
  is_public: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

export const updateAssetTypeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  division: z.enum(["vault_product", "vault_service", "shop_product", "shop_service", "community"]).optional(),
  is_internal: z.boolean().optional(),
  is_public: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export const createFieldSchema = z.object({
  slug: z.string().regex(/^[a-z0-9_]+$/),
  label: z.string().min(1).max(100),
  field_type: z.enum(["text", "textarea", "number", "boolean", "select", "multi_select", "date", "url", "image", "file", "richtext", "tags", "color", "rating"]),
  config: z.any().optional(),
  is_required: z.boolean().default(false),
  is_filterable: z.boolean().default(false),
  is_showcase: z.boolean().default(false),
  placeholder: z.string().optional(),
  help_text: z.string().optional(),
  sort_order: z.number().int().default(0),
});

export const updateFieldSchema = z.object({
  label: z.string().min(1).max(100).optional(),
  field_type: z.enum(["text", "textarea", "number", "boolean", "select", "multi_select", "date", "url", "image", "file", "richtext", "tags", "color", "rating"]).optional(),
  config: z.any().optional(),
  is_required: z.boolean().optional(),
  is_filterable: z.boolean().optional(),
  is_showcase: z.boolean().optional(),
  placeholder: z.string().nullable().optional(),
  help_text: z.string().nullable().optional(),
  sort_order: z.number().int().optional(),
});
