import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateAssetSchema } from "@/lib/validations/assets";
import { validateMetadata } from "@/lib/metadata-validator";
import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// GET   /api/assets/[id]  → get one asset with all relations
// PATCH /api/assets/[id]  → update asset (metadata re-validated)
// ---------------------------------------------------------------------------

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        asset_type: {
          include: { fields: { orderBy: { sort_order: "asc" } } },
        },
        field_values: { include: { field: true } },
        versions: { orderBy: { created_at: "desc" } },
        thumbnails: { orderBy: { sort_order: "asc" } },
        tags: { include: { tag: { include: { group: true } } } },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(asset);
  } catch (error) {
    logger.error("Failed to get asset", { error: String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const existing = await prisma.asset.findUnique({
      where: { id },
      include: { asset_type: { include: { fields: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateAssetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    // If metadata changed, re-validate against the type's field definitions
    if (parsed.data.metadata !== undefined) {
      const metadataResult = validateMetadata(
        parsed.data.metadata,
        existing.asset_type.fields,
      );
      if (!metadataResult.success) {
        return NextResponse.json(
          { error: "Metadata validation failed", issues: metadataResult.error.issues },
          { status: 400 },
        );
      }
    }

    // Update the asset
    const updated = await prisma.$transaction(async (tx) => {
      const asset = await tx.asset.update({
        where: { id },
        data: {
          ...(parsed.data.name !== undefined && { name: parsed.data.name }),
          ...(parsed.data.description !== undefined && { description: parsed.data.description }),
          ...(parsed.data.metadata !== undefined && { metadata: parsed.data.metadata }),
          ...(parsed.data.status !== undefined && {
            status: parsed.data.status,
            ...(parsed.data.status === "published" && !existing.published_at
              ? { published_at: new Date() }
              : {}),
          }),
        },
      });

      // Refresh denormalized field values if metadata changed
      if (parsed.data.metadata !== undefined) {
        await tx.assetFieldValue.deleteMany({ where: { asset_id: id } });

        const metadata = parsed.data.metadata as Record<string, any>;
        const filterableFields = existing.asset_type.fields.filter((f) => f.is_filterable);

        if (filterableFields.length > 0) {
          const values = filterableFields
            .filter((f) => metadata[f.slug] !== undefined)
            .map((f) => {
              const raw = metadata[f.slug];
              return {
                asset_id: id,
                field_id: f.id,
                ...mapFieldValue(f.field_type, raw),
              };
            });

          if (values.length > 0) {
            await tx.assetFieldValue.createMany({ data: values });
          }
        }
      }

      return asset;
    });

    logger.info("Asset updated", { id, status: updated.status });
    return NextResponse.json(updated);
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "An asset with this slug already exists" },
        { status: 409 },
      );
    }
    logger.error("Failed to update asset", { error: String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Map a field value to typed columns (used during update)
// ---------------------------------------------------------------------------

function mapFieldValue(
  fieldType: string,
  value: any,
): { value_text?: string; value_number?: number; value_boolean?: boolean; value_date?: Date; value_json?: any } {
  switch (fieldType) {
    case "text":
    case "textarea":
    case "url":
    case "color":
    case "select":
      return { value_text: String(value) };
    case "number":
      return { value_number: Number(value) };
    case "boolean":
      return { value_boolean: Boolean(value) };
    case "date":
      return { value_date: new Date(String(value)) };
    case "multi_select":
    case "tags":
    case "richtext":
    case "image":
    case "file":
      return { value_json: value };
    case "rating":
      return { value_number: Number(value) };
    default:
      return { value_text: JSON.stringify(value) };
  }
}
