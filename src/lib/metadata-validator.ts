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

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function getNumberProp(config: unknown, key: string): number | undefined {
  if (!isObject(config)) return undefined;
  const v = config[key];
  return typeof v === "number" ? v : undefined;
}

function getStringArrayProp(config: unknown, key: string): string[] | undefined {
  if (!isObject(config)) return undefined;
  const v = config[key];
  if (!Array.isArray(v)) return undefined;
  return v.every((item): item is string => typeof item === "string") ? v : undefined;
}

/**
 * Builds a Zod object schema from an AssetType's field definitions.
 * Each field's `field_type` determines the Zod type, and its `config` JSON
 * provides type-specific constraints (min/max for numbers, options for selects, etc.).
 */
export function buildMetadataSchema(fields: AssetTypeField[]): z.ZodObject<z.ZodRawShape> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let base: z.ZodTypeAny;

    switch (field.field_type) {
      case "text":
      case "url":
      case "color":
      case "textarea":
      case "richtext":
        base = z.string();
        break;
      case "number": {
        base = z.number();
        const min = getNumberProp(field.config, "min");
        const max = getNumberProp(field.config, "max");
        if (min !== undefined) base = (base as z.ZodNumber).min(min);
        if (max !== undefined) base = (base as z.ZodNumber).max(max);
        break;
      }
      case "boolean":
        base = z.boolean();
        break;
      case "select": {
        const options = getStringArrayProp(field.config, "options");
        if (options && options.length > 0) {
          base = z.enum(options as [string, ...string[]]);
        } else {
          base = z.string();
        }
        break;
      }
      case "multi_select":
        base = z.array(z.string());
        break;
      case "date":
        base = z.string();
        break;
      case "tags": {
        base = z.array(z.string());
        const maxTags = getNumberProp(field.config, "max_tags");
        if (maxTags !== undefined) base = (base as z.ZodArray<z.ZodString>).max(maxTags);
        break;
      }
      case "image":
      case "file":
        base = z.object({
          filename: z.string(),
          url: z.string().optional(),
          size_bytes: z.number().optional(),
        }).optional();
        break;
      case "rating": {
        const max = getNumberProp(field.config, "max") ?? 5;
        base = z.number().min(1).max(max);
        break;
      }
      default:
        base = z.unknown();
    }

    shape[field.slug] = field.is_required ? base : base.optional();
  }

  return z.object(shape).passthrough();
}

/**
 * Validates a metadata record against an AssetType's field definitions.
 */
export function validateMetadata(
  metadata: unknown,
  fields: AssetTypeField[],
): { success: true; data: Record<string, unknown> } | { success: false; error: z.ZodError } {
  const schema = buildMetadataSchema(fields);
  const result = schema.safeParse(metadata);
  if (result.success) {
    return { success: true, data: result.data as Record<string, unknown> };
  }
  return { success: false, error: result.error };
}
