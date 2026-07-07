"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui";

// ---------------------------------------------------------------------------
// ProductCard — grid card for the marketplace listing page
// ---------------------------------------------------------------------------

interface ProductCardAsset {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  asset_type: { slug: string; name: string; icon: string | null };
  thumbnails: Array<{ url: string; purpose: string }>;
  tags: Array<{ tag: { id: string; name: string; color: string | null } }>;
  versions: Array<{ version: string }>;
  published_at: string | null;
}

export function ProductCard({ asset }: { asset: ProductCardAsset }) {
  const cover = asset.thumbnails.find((t) => t.purpose === "cover") ?? asset.thumbnails[0];
  const latestVersion = asset.versions[0]?.version;

  return (
    <Link
      href={`/marketplace/${asset.slug}`}
      className="group block rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] transition-colors hover:border-[var(--border-active)] hover:bg-[var(--bg-elevated)]"
    >
      {/* Image area */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-[var(--bg-elevated)]">
        {cover ? (
          <img
            src={cover.url}
            alt={asset.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-12 w-12 text-[var(--text-muted)]" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {/* Asset type badge */}
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="accent" size="sm">
            {asset.asset_type.name}
          </Badge>
          {latestVersion && (
            <Badge variant="muted" size="sm">
              v{latestVersion}
            </Badge>
          )}
        </div>

        {/* Name */}
        <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
          {asset.name}
        </h3>

        {/* Description — first line truncated */}
        {asset.description && (
          <p className="mt-1 line-clamp-1 text-xs text-[var(--text-muted)]">
            {asset.description}
          </p>
        )}

        {/* Tags — max 3 */}
        {asset.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {asset.tags.slice(0, 3).map((t) => (
              <span
                key={t.tag.id}
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider border-[var(--border-default)] text-[var(--text-secondary)]"
              >
                {t.tag.name}
              </span>
            ))}
            {asset.tags.length > 3 && (
              <span className="text-[10px] text-[var(--text-muted)]">
                +{asset.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
