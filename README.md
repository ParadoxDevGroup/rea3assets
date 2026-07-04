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

# 4. Push the schema
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
├── proxy.ts                  # Edge proxy — auth guard for admin + API
├── prisma/
│   └── schema.prisma         # 14 models: AssetType → PipelineStepResult
├── uploads/                  # Local file upload directory (gitignored)
├── __tests__/                # Vitest tests (41 tests)
├── src/
│   ├── app/
│   │   ├── (admin)/          # Admin UI pages (route group)
│   │   │   ├── page.tsx          # Dashboard
│   │   │   ├── layout.tsx        # Admin shell (sidebar + topbar)
│   │   │   ├── asset-types/      # Asset type management
│   │   │   ├── assets/           # Asset management (list, detail, new)
│   │   │   ├── tags/             # Tag group management
│   │   │   ├── pipelines/        # Pipeline configuration
│   │   │   ├── settings/         # Settings (general, ERP integration)
│   │   │   └── login/            # Login page
│   │   └── api/               # API routes
│   │       ├── asset-types/      # Asset types CRUD
│   │       ├── assets/           # Assets CRUD, versions, tags
│   │       ├── tag-groups/       # Tag groups + nested tags CRUD
│   │       ├── pipelines/        # Pipeline configs + steps CRUD
│   │       ├── upload/           # File upload
│   │       ├── auth/             # Login + logout
│   │       ├── settings/         # ERP connection test
│   │       └── internal/         # Internal SKU sync endpoint
│   ├── components/
│   │   ├── layout/            # AppShell, Sidebar, TopBar
│   │   └── ui/                # Shared UI primitives
│   └── lib/
│       ├── prisma.ts          # Singleton PrismaClient (adapter-pg)
│       ├── logger.ts          # Structured JSON logger
│       ├── metadata-validator.ts  # Runtime Zod schema builder
│       ├── field-value-mapper.ts  # Shared field type → column mapper
│       ├── erp-client.ts      # ERP integration client
│       ├── storage.ts         # File storage abstraction
│       ├── auth.ts            # Session auth helpers
│       └── validations/       # Zod schemas for all entities
```

## API endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/asset-types` | List / create asset types |
| GET/PATCH/DELETE | `/api/asset-types/[slug]` | Single asset type |
| GET/POST | `/api/asset-types/[slug]/fields` | List / create fields |
| PATCH/DELETE | `/api/asset-types/[slug]/fields/[fieldSlug]` | Single field |
| GET/POST | `/api/assets` | List (with filters) / create asset |
| GET/PATCH | `/api/assets/[id]` | Single asset |
| GET/POST | `/api/assets/[id]/versions` | Asset version history |
| PATCH/DELETE | `/api/assets/[id]/versions/[versionId]` | Single version |
| GET/POST | `/api/assets/[id]/tags` | Asset tag assignments |
| GET/POST | `/api/tag-groups` | List / create tag groups |
| GET/PATCH/DELETE | `/api/tag-groups/[slug]` | Single tag group |
| POST | `/api/tag-groups/[slug]/tags` | Create tag inside group |
| PATCH/DELETE | `/api/tag-groups/[slug]/tags/[tagSlug]` | Single tag |
| GET/POST | `/api/pipelines` | List / create pipeline configs |
| GET/PATCH/DELETE | `/api/pipelines/[id]` | Single pipeline |
| GET/POST | `/api/pipelines/[id]/steps` | List / add steps |
| POST | `/api/upload` | File upload (multipart) |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/internal/sku-sync` | ERP SKU sync stub |
| POST | `/api/settings/erp-test` | Test ERP connection |

## Admin UI pages

| Route | Purpose |
|-------|---------|
| `/` | Dashboard — live stats |
| `/asset-types` | Manage asset type definitions |
| `/asset-types/[slug]` | Edit type fields + settings |
| `/assets` | Browse all assets with filters |
| `/assets/[id]` | Asset detail with metadata, versions, tags |
| `/assets/new` | Create a new asset (dynamic form) |
| `/tags` | Manage tag groups and tags |
| `/pipelines` | Configure processing pipelines |
| `/settings` | General settings |
| `/settings/erp` | ERP integration settings |
| `/login` | Authentication |

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `ASSET_DB_URL` | yes | `postgresql://postgres:***@localhost:5432/rea3_assets?schema=public` | PostgreSQL connection string |
| `ADMIN_PASSWORD` | for auth | — | Password for admin UI login. Unset = no auth (dev mode) |
| `ERP_INTERNAL_API_KEY` | for publish | — | API key for SKU sync with rea3erp |
| `ERP_INTERNAL_URL` | for publish | `http://localhost:3000` | Base URL of the core ERP |
| `UPLOAD_DIR` | no | `./uploads` | Directory for uploaded files |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run test` | Run Vitest suite (41 tests) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run lint` | ESLint |
| `npm run db:push` | Push schema to PostgreSQL |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:validate` | Validate schema.prisma |

## Architecture decisions

- **Separate database from ERP** — The asset manager is an optional addon. It runs on its own PostgreSQL database to avoid coupling and to keep the ERP schema lean.
- **JSONB metadata + denormalized field_values** — Custom fields are stored in a JSONB `metadata` column for flexibility, with a parallel `AssetFieldValue` table for indexed queries on filterable fields.
- **Schema-driven, not code-driven** — Adding a new asset type requires zero code changes. An admin creates it in the UI, defines fields, and the system renders everything from that schema.
- **Pipeline architecture** — Processing is pluggable. New processors (virus scan, mesh optimization, AI thumbnail generation) can be registered without touching existing code.
- **Auth via edge proxy** — An HMAC-signed session cookie is verified by Next.js edge middleware (proxy). When `ADMIN_PASSWORD` is set, all routes except login are protected.
- **Local file storage first** — The storage backend is swappable (local filesystem by default, swap to S3/R2 without changing callers).

## Auth

When `ADMIN_PASSWORD` is set in `.env`, the edge proxy protects all admin UI pages and API routes. Unauthenticated requests are redirected to `/login` (pages) or return 401 (API).

When `ADMIN_PASSWORD` is unset, auth is disabled and all routes are open (development mode).
