"use client";

import { X, Package, Layers } from "lucide-react";

// ---------------------------------------------------------------------------
// FilterSidebar — horizontal filter bar above the product grid
// ---------------------------------------------------------------------------

interface AssetTypeOption {
  slug: string;
  name: string;
  count: number;
}

interface TagOption {
  id: string;
  slug: string;
  name: string;
  color: string | null;
  group: string;
}

interface ActiveFilters {
  asset_type: string | null;
  tags: string[];
  division: string | null;
}

interface DivisionOption {
  slug: string;
  count: number;
}

interface FilterSidebarProps {
  assetTypes: AssetTypeOption[];
  tags: TagOption[];
  divisions: DivisionOption[];
  activeFilters: ActiveFilters;
  onFilterChange: (filters: ActiveFilters) => void;
}

export function FilterSidebar({
  assetTypes,
  tags,
  divisions,
  activeFilters,
  onFilterChange,
}: FilterSidebarProps) {
  const toggleDivision = (slug: string | null) => {
    onFilterChange({ ...activeFilters, division: slug });
  };

  const toggleAssetType = (slug: string | null) => {
    onFilterChange({ ...activeFilters, asset_type: slug });
  };

  const toggleTag = (slug: string) => {
    const current = activeFilters.tags;
    const next = current.includes(slug)
      ? current.filter((t) => t !== slug)
      : [...current, slug];
    onFilterChange({ ...activeFilters, tags: next });
  };

  const removeTag = (slug: string) => {
    onFilterChange({
      ...activeFilters,
      tags: activeFilters.tags.filter((t) => t !== slug),
    });
  };

  const clearAll = () => {
    onFilterChange({ asset_type: null, tags: [], division: null });
  };

  const hasActiveFilters = activeFilters.asset_type !== null || activeFilters.tags.length > 0 || activeFilters.division !== null;

  const divisionLabel = (slug: string) =>
    slug === "vault_product" ? "Vault" : slug === "shop_product" ? "Shop" : slug;

  return (
    <div className="space-y-3">
      {/* Division chips */}
      {divisions.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
            Catalog
          </p>
          <div className="flex flex-wrap gap-2">
            {/* "All" chip */}
            <button
              onClick={() => toggleDivision(null)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                activeFilters.division === null
                  ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                  : "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              All
            </button>
            {divisions.map((div) => (
              <button
                key={div.slug}
                onClick={() => toggleDivision(div.slug)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  activeFilters.division === div.slug
                    ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                    : "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                }`}
              >
                <Layers className="h-3 w-3" />
                {divisionLabel(div.slug)}
                <span className="text-[10px] opacity-70">({div.count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Asset type chips */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
          Type
        </p>
        <div className="flex flex-wrap gap-2">
          {/* "All" chip */}
          <button
            onClick={() => toggleAssetType(null)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              activeFilters.asset_type === null
                ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                : "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            }`}
          >
            All
          </button>
          {assetTypes.map((at) => (
            <button
              key={at.slug}
              onClick={() => toggleAssetType(at.slug)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                activeFilters.asset_type === at.slug
                  ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                  : "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <Package className="h-3 w-3" />
              {at.name}
              <span className="text-[10px] opacity-70">({at.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tag chips */}
      {tags.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
            Tags
          </p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isActive = activeFilters.tags.includes(tag.slug);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.slug)}
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                      : "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                  }`}
                  style={
                    isActive && tag.color
                      ? {
                          borderColor: tag.color,
                          backgroundColor: `${tag.color}1a`,
                          color: tag.color,
                        }
                      : undefined
                  }
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active filter chips (dismissible) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border-subtle)] pt-3">
          <span className="text-xs text-[var(--text-muted)]">Active:</span>
          {activeFilters.division && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent)] bg-[var(--accent-muted)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--accent)]">
              {divisionLabel(activeFilters.division)}
              <button
                onClick={() => toggleDivision(null)}
                className="ml-0.5 opacity-70 hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {activeFilters.asset_type && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent)] bg-[var(--accent-muted)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--accent)]">
              {assetTypes.find((at) => at.slug === activeFilters.asset_type)?.name ??
                activeFilters.asset_type}
              <button
                onClick={() => toggleAssetType(null)}
                className="ml-0.5 opacity-70 hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {activeFilters.tags.map((tagSlug) => {
            const tag = tags.find((t) => t.slug === tagSlug);
            return (
              <span
                key={tagSlug}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--accent)] bg-[var(--accent-muted)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--accent)]"
              >
                {tag?.name ?? tagSlug}
                <button
                  onClick={() => removeTag(tagSlug)}
                  className="ml-0.5 opacity-70 hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
          <button
            onClick={clearAll}
            className="text-[10px] font-medium text-[var(--text-muted)] underline hover:text-[var(--text-secondary)]"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
