import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// ---------------------------------------------------------------------------
// Seed — bootstraps demo data for development and testing
// ---------------------------------------------------------------------------

const connectionUrl =
  process.env.ASSET_DB_URL ??
  "postgresql://postgres:postgres@localhost:5432/rea3_assets?schema=public";

const adapter = new PrismaPg({ connectionString: connectionUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding rea3_assets...\n");

  // ── Tag Groups ────────────────────────────────────────────────────────
  const genreGroup = await prisma.tagGroup.upsert({
    where: { slug: "genre" },
    update: {},
    create: { slug: "genre", name: "Genre", sort_order: 0 },
  });
  const styleGroup = await prisma.tagGroup.upsert({
    where: { slug: "style" },
    update: {},
    create: { slug: "style", name: "Art Style", sort_order: 1 },
  });
  const engineGroup = await prisma.tagGroup.upsert({
    where: { slug: "engine" },
    update: {},
    create: { slug: "engine", name: "Game Engine", sort_order: 2 },
  });

  // ── Tags ──────────────────────────────────────────────────────────────
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { group_id_slug: { group_id: genreGroup.id, slug: "fantasy" } },
      update: {},
      create: { group_id: genreGroup.id, slug: "fantasy", name: "Fantasy", color: "#a855f7" },
    }),
    prisma.tag.upsert({
      where: { group_id_slug: { group_id: genreGroup.id, slug: "scifi" } },
      update: {},
      create: { group_id: genreGroup.id, slug: "scifi", name: "Sci-Fi", color: "#06b6d4" },
    }),
    prisma.tag.upsert({
      where: { group_id_slug: { group_id: genreGroup.id, slug: "modern" } },
      update: {},
      create: { group_id: genreGroup.id, slug: "modern", name: "Modern", color: "#22c55e" },
    }),
    prisma.tag.upsert({
      where: { group_id_slug: { group_id: styleGroup.id, slug: "stylized" } },
      update: {},
      create: { group_id: styleGroup.id, slug: "stylized", name: "Stylized", color: "#f59e0b" },
    }),
    prisma.tag.upsert({
      where: { group_id_slug: { group_id: styleGroup.id, slug: "realistic" } },
      update: {},
      create: { group_id: styleGroup.id, slug: "realistic", name: "Realistic", color: "#3b82f6" },
    }),
    prisma.tag.upsert({
      where: { group_id_slug: { group_id: engineGroup.id, slug: "roblox" } },
      update: {},
      create: { group_id: engineGroup.id, slug: "roblox", name: "Roblox", color: "#ef4444" },
    }),
    prisma.tag.upsert({
      where: { group_id_slug: { group_id: engineGroup.id, slug: "unreal" } },
      update: {},
      create: { group_id: engineGroup.id, slug: "unreal", name: "Unreal Engine", color: "#8b5cf6" },
    }),
  ]);

  console.log(`  ✓ ${tags.length} tags across ${3} groups`);

  // ── Asset Type: Character Model ────────────────────────────────────────
  const charType = await prisma.assetType.upsert({
    where: { slug: "character-model" },
    update: {},
    create: {
      slug: "character-model",
      name: "Character Model",
      description: "3D character models with rigging and animation support",
      icon: "Users",
      division: "vault_product",
      is_internal: true,
      is_public: true,
      sort_order: 0,
    },
  });

  // Fields
  const charFields = [
    { slug: "polygon_count", label: "Polygon Count", field_type: "number" as const, is_filterable: true, sort_order: 0 },
    { slug: "rig_type", label: "Rig Type", field_type: "select" as const, config: { options: ["R6", "R15", "Rthro", "Custom", "None"] }, is_filterable: true, sort_order: 1 },
    { slug: "animation_set", label: "Animation Set", field_type: "select" as const, config: { options: ["Idle", "Walk", "Run", "Combat", "Full Suite", "None"] }, sort_order: 2 },
    { slug: "texture_resolution", label: "Texture Resolution", field_type: "select" as const, config: { options: ["512", "1024", "2048", "4096"] }, sort_order: 3 },
    { slug: "lod_levels", label: "LOD Levels", field_type: "number" as const, config: { min: 0, max: 5 }, sort_order: 4 },
    { slug: "pbr_ready", label: "PBR Ready", field_type: "boolean" as const, sort_order: 5 },
    { slug: "notes", label: "Technical Notes", field_type: "textarea" as const, sort_order: 6 },
  ];

  for (const f of charFields) {
    await prisma.assetTypeField.upsert({
      where: { asset_type_id_slug: { asset_type_id: charType.id, slug: f.slug } },
      update: {},
      create: { ...f, asset_type_id: charType.id },
    });
  }
  console.log(`  ✓ Asset type: Character Model (${charFields.length} fields)`);

  // ── Asset Type: Environment Kit ─────────────────────────────────────────
  const envType = await prisma.assetType.upsert({
    where: { slug: "environment-kit" },
    update: {},
    create: {
      slug: "environment-kit",
      name: "Environment Kit",
      description: "Modular environment pieces and terrain assets",
      icon: "Mountain",
      division: "vault_product",
      is_internal: true,
      is_public: true,
      sort_order: 1,
    },
  });

  const envFields = [
    { slug: "piece_count", label: "Piece Count", field_type: "number" as const, sort_order: 0 },
    { slug: "theme", label: "Theme", field_type: "select" as const, config: { options: ["Fantasy", "Sci-Fi", "Modern", "Nature", "Industrial"] }, is_filterable: true, sort_order: 1 },
    { slug: "modular", label: "Modular", field_type: "boolean" as const, sort_order: 2 },
    { slug: "tileable", label: "Tileable Textures", field_type: "boolean" as const, sort_order: 3 },
    { slug: "polygon_budget", label: "Polygon Budget (total)", field_type: "number" as const, sort_order: 4 },
  ];

  for (const f of envFields) {
    await prisma.assetTypeField.upsert({
      where: { asset_type_id_slug: { asset_type_id: envType.id, slug: f.slug } },
      update: {},
      create: { ...f, asset_type_id: envType.id },
    });
  }
  console.log(`  ✓ Asset type: Environment Kit (${envFields.length} fields)`);

  // ── Demo Assets ─────────────────────────────────────────────────────────
  const demoAssets = [
    {
      asset_type_id: charType.id,
      slug: "fantasy-knight",
      name: "Fantasy Knight",
      description: "A heavily-armored knight character with full combat animation suite. Ideal for RPG and action games.",
      division: "vault_product",
      status: "published" as const,
      metadata: {
        polygon_count: 12450,
        rig_type: "R15",
        animation_set: "Combat",
        texture_resolution: "2048",
        lod_levels: 3,
        pbr_ready: true,
        notes: "Includes LOD0 (12.4k), LOD1 (6.2k), LOD2 (2.1k). PBR metallic-roughness workflow.",
      },
      tags: [tags[0].id, tags[3].id, tags[5].id], // Fantasy, Stylized, Roblox
    },
    {
      asset_type_id: charType.id,
      slug: "cyber-enforcer",
      name: "Cyber Enforcer",
      description: "Futuristic law enforcement character with holographic accessories and energy weapon rig.",
      division: "vault_product",
      status: "published" as const,
      metadata: {
        polygon_count: 18900,
        rig_type: "Rthro",
        animation_set: "Full Suite",
        texture_resolution: "4096",
        lod_levels: 4,
        pbr_ready: true,
        notes: "Custom shader for holographic elements. Includes emissive maps for neon accents.",
      },
      tags: [tags[1].id, tags[3].id, tags[6].id], // Sci-Fi, Stylized, Unreal
    },
    {
      asset_type_id: envType.id,
      slug: "medieval-village-kit",
      name: "Medieval Village Kit",
      description: "Complete modular medieval village set with houses, walls, market stalls, and props.",
      division: "vault_product",
      status: "published" as const,
      metadata: {
        piece_count: 87,
        theme: "Fantasy",
        modular: true,
        tileable: true,
        polygon_budget: 250000,
      },
      tags: [tags[0].id, tags[3].id, tags[5].id], // Fantasy, Stylized, Roblox
    },
    {
      asset_type_id: charType.id,
      slug: "tactical-operator",
      name: "Tactical Operator",
      description: "Modern military operator with swappable gear and realistic proportions. WIP — early preview.",
      division: "vault_product",
      status: "draft" as const,
      metadata: {
        polygon_count: 22000,
        rig_type: "Custom",
        animation_set: "Idle",
        texture_resolution: "4096",
        lod_levels: 3,
        pbr_ready: true,
      },
      tags: [tags[2].id, tags[4].id, tags[6].id], // Modern, Realistic, Unreal
    },
  ];

  for (const a of demoAssets) {
    const { tags: tagIds, ...assetData } = a;
    const existing = await prisma.asset.findUnique({ where: { slug: a.slug } });
    let asset;
    if (existing) {
      asset = existing;
    } else {
      asset = await prisma.asset.create({ data: assetData });
    }
    // Assign tags
    for (const tagId of tagIds) {
      await prisma.assetTagAssignment.upsert({
        where: { asset_id_tag_id: { asset_id: asset.id, tag_id: tagId } },
        update: {},
        create: { asset_id: asset.id, tag_id: tagId },
      });
    }
  }
  console.log(`  ✓ ${demoAssets.length} demo assets`);

  // ── Pipeline Config ────────────────────────────────────────────────────
  const pipeline = await prisma.pipelineConfig.upsert({
    where: { asset_type_id_name: { asset_type_id: charType.id, name: "Default Processing" } },
    update: {},
    create: {
      asset_type_id: charType.id,
      name: "Default Processing",
      is_default: true,
    },
  });

  const pipelineSteps = [
    { processor: "validate-format", sort_order: 0, on_failure: "stop" as const },
    { processor: "virus-scan", sort_order: 1, on_failure: "stop" as const },
    { processor: "optimize-mesh", sort_order: 2, on_failure: "warn" as const },
    { processor: "generate-description", sort_order: 3, on_failure: "skip" as const },
    { processor: "thumbnail", sort_order: 4, on_failure: "skip" as const },
  ];

  for (const step of pipelineSteps) {
    const existing = await prisma.pipelineStep.findFirst({
      where: { pipeline_id: pipeline.id, processor: step.processor },
    });
    if (!existing) {
      await prisma.pipelineStep.create({
        data: { ...step, pipeline_id: pipeline.id },
      });
    }
  }
  console.log(`  ✓ Pipeline: Default Processing (${pipelineSteps.length} steps)`);

  // ── Summary ────────────────────────────────────────────────────────────
  const counts = {
    asset_types: await prisma.assetType.count(),
    assets: await prisma.asset.count(),
    tag_groups: await prisma.tagGroup.count(),
    tags: await prisma.tag.count(),
    pipelines: await prisma.pipelineConfig.count(),
  };

  console.log("\n✅ Seed complete:");
  console.log(`   ${counts.asset_types} asset types, ${counts.assets} assets`);
  console.log(`   ${counts.tag_groups} tag groups, ${counts.tags} tags`);
  console.log(`   ${counts.pipelines} pipelines`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
