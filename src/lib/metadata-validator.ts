import { z } from "zod/v4";
import type { AssetTypeField } from "@prisma/client";

// ---------------------------------------------------------------------------
// Runtime Metadata Validator
// ---------------------------------------------------------------------------
//
// This is the core of "customizable user input variables" — the admin defines
// fields in the DB via AssetTypeField, and these functions build a Zod schema
// at runtime to validate submitted metadata. No codegen needed.
//
// Usage:
//   const fields = await prisma.assetTypeField.findMany({ where: { asset_type_id } });
//   const result = validateMetadata(body.metadata, fields);
//   if (!result.success) return Response.json({ errors: result.errors }, { status: 400 });

/**
 * Builds a Zod object schema from an AssetType's field definitions.
 * Each field's `field_type` determines the Zod type, and its `config` JSON
 * provides type-specific constraints (min/max for numbers, options for selects, etc.).
 *
 * @param fields - The AssetTypeField[] for a given asset type.
 * @returns A Zod object schema keyed by field slug.
 */
export function buildMetadataSchema(fields: AssetTypeField[]): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let base: z.ZodTypeAny;

    switch (field.field_type) {
      case "text":
      case "url":
      case "color":
        base = z.string();
        break;
      case "textarea":
      case "richtext":
        base = z.string();
        break;
      case "number":
        base = z.number();
        if (field.config) {
          const cfg = field.config as any;
          if (cfg?.min !== undefined) base = (base as z.ZodNumber).min(cfg.min);
          if (cfg?.max !== undefined) base = (base as z.ZodNumber).max(cfg.max);
        }
        break;
      case "boolean":
        base = z.boolean();
        break;
      case "select":
        base = z.string();
        if (field.config) {
          const cfg = field.config as any;
          if (cfg?.options) base = z.enum(cfg.options as [string, ...string[]]);
        }
        break;
      case "multi_select":
        base = z.array(z.string());
        break;
      case "date":
        base = z.string(); // ISO date string
        break;
      case "tags":
        base = z.array(z.string());
        if (field.config) {
          const cfg = field.config as any;
          if (cfg?.max_tags) base = (base as z.ZodArray<any>).max(cfg.max_tags);
        }
        break;
      case "image":
      case "file":
        base = z.object({
          filename: z.string(),
          url: z.string().optional(),
          size_bytes: z.number().optional(),
        }).optional();
        break;
      case "rating":
        base = z.number().min(1).max(field.config ? (field.config as any).max ?? 5 : 5);
        break;
      default:
        base = z.any();
    }

    shape[field.slug] = field.is_required ? base : base.optional();
  }

  return z.object(shape);
}

/**
 * Validates a metadata record against an AssetType's field definitions.
 *
 * @param metadata - The submitted metadata JSON (unknown at runtime).
 * @param fields   - The AssetTypeField[] defining the expected shape.
 * @returns A discriminated union: either { success: true, data } or { success: false, errors }.
 */
export function validateMetadata(
  metadata: unknown,
  fields: AssetTypeField[],
): { success: true; data: Record<string, any> } | { success: false; error: z.ZodError } {
  const schema = buildMetadataSchema(fields);
  const result = schema.safeParse(metadata);
  if (result.success) {
    return { success: true, data: result.data as Record<string, any> };
  }
  return { success: false, error: result.error as z.ZodError };
}
