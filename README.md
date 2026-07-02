# rea3-assets

**ReA3 Asset Manager** — a schema-driven game asset CMS that powers both the internal studio library and the public marketplace storefront.

## What is this?

rea3-assets is the asset management addon for [ReA3 ERP](https://github.com/PARADOX-Studio/rea3erp). It manages every game-development asset the studio creates — character models, environment kits, sound effects, UI components, and more.

The core innovation: **nothing is hardcoded.** An admin defines "Character Model" as an asset type with custom fields (`polygon_count`, `rig_type`, `animation_set`). The system auto-generates the upload form, validation rules, internal library filters, and marketplace product page from that schema.

## How it relates to rea3erp

| Concern | Lives in |
|---|---|
| Asset metadata, versions, tags, thumbnails | **rea3-assets** (this repo) |
| Pricing, orders, licenses, subscriptions | **rea3erp** |
| Customer accounts, invoices, entitlements | **rea3erp** |

When an asset is published to the marketplace, rea3-assets syncs a `ProductSKU` to rea3erp via its internal API. The ERP handles all money and fulfillment. This repo only deals with the asset itself.

**Integration contract:** The `Asset.sku` column is an optional FK into `ProductSKU.sku` on the ERP side. The bridge is a REST call — rea3-assets calls `POST /api/internal/sku-sync` on the ERP with an `ERP_INTERNAL_API_KEY`.

## Prerequisites

- **Node.js** >= 22.0.0
- **PostgreSQL** 15
- **npm** >= 10

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set ASSET_DB_URL to your PostgreSQL connection string

# 3. Create the database
psql -c "CREATE DATABASE rea3_assets;"

# 4. Push the schema (no migrations yet — early scaffold phase)
npm run db:push

# 5. Start the dev server
npm run dev
# → http://localhost:3000
```

## Project layout

```
rea3assets/
├── package.json              # @rea3/asset-manager v0.1.0
├── tsconfig.json             # TypeScript 6, path alias @/ → src/
├── prisma.config.ts          # Prisma datasource config (ASSET_DB_URL)
├── vitest.config.ts          # Vitest 4, path alias
├── .env.example              # Required env vars
├── prisma/
│   └── schema.prisma         # 16 models: AssetType → PipelineStepResult
├── src/
│   └── lib/
│       ├── prisma.ts         # Singleton PrismaClient (adapter-pg)
│       ├── logger.ts         # Structured JSON logger
│       ├── metadata-validator.ts  # Runtime Zod schema builder from field defs
│       └── validations/
│           └── fields.ts     # Zod schemas per FieldType config
└── __tests__/                # Vitest tests (coming in later phases)
```

## Database models (16 tables)

| Model | Purpose |
|---|---|
| `AssetType` | User-defined asset categories (Character Model, Sound Effect, etc.) |
| `AssetTypeField` | Custom metadata fields per type (polygon_count, rig_type, ...) |
| `Asset` | Individual asset instance with JSONB metadata |
| `AssetFieldValue` | Denormalized key-value store for filterable fields |
| `AssetVersion` | Semver version history per asset |
| `AssetThumbnail` | Gallery/cover/search thumbnails (AI-generated or manual) |
| `TagGroup` | Tag category (Genre, Art Style, Engine) |
| `Tag` | Individual tag within a group (Fantasy, Stylized, Roblox) |
| `AssetTagAssignment` | M:N join between assets and tags |
| `AssetDependency` | Self-referential dependency graph (requires/recommends) |
| `PipelineConfig` | Processing pipeline definition per asset type |
| `PipelineStep` | Individual step in a pipeline (thumbnail, validate-format, etc.) |
| `PipelineRun` | Execution record for a pipeline on a specific version |
| `PipelineStepResult` | Per-step result within a run |

## Key files

- `src/lib/metadata-validator.ts` — The runtime engine that builds a Zod schema from `AssetTypeField[]` and validates submitted metadata. This is what makes the system "schema-driven."
- `src/lib/validations/fields.ts` — Zod schemas for each `field_type`'s `config` JSON column.
- `src/lib/prisma.ts` — Singleton PrismaClient using `@prisma/adapter-pg` for connection pooling.
- `src/lib/logger.ts` — Structured JSON logger (one line per event, compatible with Logstash, CloudWatch).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to PostgreSQL |
| `npm run db:validate` | Validate schema.prisma |
| `npm run test` | Run Vitest suite |
| `npm run test:watch` | Vitest in watch mode |

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `ASSET_DB_URL` | yes | `postgresql://postgres:***@localhost:5432/rea3_assets?schema=public` | PostgreSQL connection string |
| `ERP_INTERNAL_API_KEY` | for publish | — | API key for SKU sync with rea3erp |
| `ERP_INTERNAL_URL` | for publish | `http://localhost:3000` | Base URL of the core ERP |

## Architecture decisions

- **Separate database from ERP** — The asset manager is an optional addon. It runs on its own PostgreSQL database to avoid coupling and to keep the ERP schema lean.
- **JSONB metadata + denormalized field_values** — Custom fields are stored in a JSONB `metadata` column for flexibility, with a parallel `AssetFieldValue` table for indexed queries on filterable fields.
- **Schema-driven, not code-driven** — Adding a new asset type requires zero code changes. An admin creates it in the UI, defines fields, and the system renders everything from that schema.
- **Pipeline architecture** — Processing is pluggable. New processors (virus scan, mesh optimization, AI thumbnail generation) can be registered without touching existing code.
