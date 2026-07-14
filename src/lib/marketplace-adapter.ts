// ---------------------------------------------------------------------------
// Marketplace Adapter — Map rea3assets API shapes to website UI shapes
// ---------------------------------------------------------------------------
// Pure functions with no HTTP calls. Used by BFF API routes and can be
// dropped into the website directly if it ever consumes rea3assets natively.
//
// Pricing is deliberately excluded — that's the ERP's domain. The BFF layer
// should merge ERP pricing before returning to the website, or the website
// can fetch pricing separately.

// ---------------------------------------------------------------------------
// Website interfaces (mirrored from the website codebase)
// ---------------------------------------------------------------------------

export interface WebsiteProductItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  priceCents: number;
  formatType: string;
  tags: string[];
  imageUrl: string;
  isFeatured: boolean;
}

export interface WebsiteProductDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  priceCents: number;
  formatType: string;
  version: string;
  fileSizeMB: number;
  tags: string[];
  coverUrl: string;
  previewUrl: string;
  isFeatured: boolean;
  whatYouBuild?: string;
  requirements?: string;
  features?: string;
}

export interface WebsiteShopItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  basePriceCents: number;
  imageUrl: string;
  isFeatured: boolean;
}

// ---------------------------------------------------------------------------
// Raw types from rea3assets API (subset used by adapters)
// ---------------------------------------------------------------------------

interface Rea3AssetType {
  slug: string;
  name: string;
  icon: string | null;
}

interface Rea3Thumbnail {
  url: string;
  purpose: string;
  width: number | null;
  height: number | null;
  format: string;
}

interface Rea3Tag {
  tag: { id: string; name: string; color: string | null };
}

interface Rea3Version {
  version: string;
  format: string | null;
  created_at: string;
  file_size?: number | null;
  changelog?: string | null;
}

export interface Rea3Asset {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  division: string;
  status: string;
  sku: string | null;
  metadata: Record<string, unknown>;
  published_at: string | null;
  created_at: string;
  asset_type: Rea3AssetType;
  thumbnails: Rea3Thumbnail[];
  tags: Rea3Tag[];
  versions: Rea3Version[];
  // Computed fields (v0.6.0)
  cover_url?: string | null;
  latest_version?: string | null;
  latest_format?: string | null;
  tag_names?: string[];
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

/**
 * Map a rea3assets marketplace listing asset to a website ProductItem.
 * @param asset Raw asset from GET /api/marketplace/assets
 * @param priceCents Pricing from ERP (default 0 if ERP unavailable)
 */
export function toWebsiteProductItem(
  asset: Rea3Asset,
  priceCents = 0,
): WebsiteProductItem {
  return {
    id: asset.id,
    title: asset.name,
    slug: asset.slug,
    description: asset.description ?? "",
    category: asset.asset_type.slug,
    priceCents,
    formatType: asset.latest_format ?? asset.versions[0]?.format ?? "",
    tags: asset.tag_names ?? asset.tags.map((t) => t.tag.name),
    imageUrl: asset.cover_url ?? asset.thumbnails[0]?.url ?? "",
    isFeatured: asset.metadata["featured"] === true,
  };
}

/**
 * Map a rea3assets marketplace detail asset to a website ProductDetail.
 * @param asset Raw asset from GET /api/marketplace/assets/[slug]
 * @param priceCents Pricing from ERP (default 0 if ERP unavailable)
 */
export function toWebsiteProductDetail(
  asset: Rea3Asset,
  priceCents = 0,
): WebsiteProductDetail {
  return {
    id: asset.id,
    title: asset.name,
    slug: asset.slug,
    description: asset.description ?? "",
    category: asset.asset_type.slug,
    priceCents,
    formatType: asset.versions[0]?.format ?? "",
    version: asset.versions[0]?.version ?? "1.0",
    fileSizeMB: asset.versions[0]?.file_size
      ? Number(asset.versions[0].file_size) / 1048576
      : 0,
    tags: asset.tags.map((t) => t.tag.name),
    coverUrl: asset.thumbnails[0]?.url ?? "",
    previewUrl: asset.thumbnails[1]?.url ?? "",
    isFeatured: asset.metadata["featured"] === true,
    whatYouBuild: asset.metadata?.what_you_ll_build as string | undefined,
    requirements: asset.metadata?.requirements as string | undefined,
    features: asset.metadata?.features as string | undefined,
  };
}

/**
 * Map a rea3assets marketplace listing asset to a website ShopItem.
 * @param asset Raw asset from GET /api/marketplace/assets?division=shop_product
 * @param priceCents Pricing from ERP (default 0 if ERP unavailable)
 */
export function toWebsiteShopItem(
  asset: Rea3Asset,
  priceCents = 0,
): WebsiteShopItem {
  return {
    id: asset.id,
    title: asset.name,
    slug: asset.slug,
    description: asset.description ?? "",
    category: asset.asset_type.name,
    basePriceCents: priceCents,
    imageUrl: asset.cover_url ?? asset.thumbnails[0]?.url ?? "",
    isFeatured: asset.metadata["featured"] === true,
  };
}
