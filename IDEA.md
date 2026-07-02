Hermes project at D:\projects\rea3assets for the ReA3 Asset Manager.

## What rea3-assets is
An optional addon module for the ReA3 ERP that manages game-dev assets (3D models, UI components, audio, etc.) and powers the public marketplace at rea3.studio/marketplace. It's a schema-driven CMS — admin defines asset types with custom fields in the UI, the system auto-generates forms, validators, filters, and marketplace pages from those definitions.

## Reference repo: D:\projects\rea3erp
The existing rea3erp is the financial ERP that rea3-assets integrates with. Use it as the reference for:
- Tooling conventions: Next.js 16, Prisma 7.x with PG adapter, Tailwind CSS 4, Zod 4, TypeScript 6, Vitest 4, Node >= 22
- Code style: structured JSON logger (src/lib/logger.ts pattern), withRole/withAuth middleware, Zod validation schemas, try/catch with logger.error in all API routes
- Database: PostgreSQL 15, separate database from the ERP (rea3_assets vs rea3erp), same Prisma pattern (prisma.config.ts with datasource url from env, adapter-pg for PrismaClient)
- Auth: same session-based auth with ERP_INTERNAL_API_KEY for internal API calls
- Project structure: src/app/(admin)/, src/app/api/, src/lib/, src/components/, prisma/, __tests__/
- README standard: prerequisites table, bootstrap steps, project layout map, gotchas table, CONTRIBUTING section

## Integration point with rea3erp
The ERP already has an `Asset` table (tracks file_path, version, checksum per SKU), a `ProductSKU` table (73 products with pricing/licensing), and an `AccessKey` table (time-limited download links). The Asset Manager will:
- Have its own database and Prisma schema (rea3_assets)
- Call the ERP's internal API to sync SKUs when an asset is published
- Update the ERP's `Asset` table with file_path + version + checksum on publish
- Not touch ERP financial data (orders, invoices, GL) — it's purely the content layer

The integration client should live at `src/lib/erp-client.ts` in the new repo.
