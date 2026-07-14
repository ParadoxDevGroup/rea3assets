"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ArrowLeft, ArrowRight, Package } from "lucide-react";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { FilterSidebar } from "@/components/marketplace/FilterSidebar";
import { ErrorBanner, Skeleton } from "@/components/ui";

// ---------------------------------------------------------------------------
// Marketplace listing page — /marketplace
// Fetches from /api/marketplace/assets with URL-driven filters.
// Wrapped in Suspense to satisfy Next.js useSearchParams requirement.
// Cyberpunk dark aesthetic matching the login page and rea3.studio brand.
// ---------------------------------------------------------------------------

export default function MarketplacePage() {
  return (
    <Suspense fallback={<MarketplaceFallback />}>
      <MarketplaceContent />
    </Suspense>
  );
}

function MarketplaceFallback() {
  return (
    <div className="space-y-6" aria-hidden="true">
      {/* Hero skeleton */}
      <div className="py-8 text-center">
        <Skeleton className="mx-auto mb-3 h-16 w-16 rounded-2xl" />
        <Skeleton className="mx-auto h-10 w-64" />
        <Skeleton className="mx-auto mt-2 h-4 w-48" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

interface AssetTypeOption {
  slug: string;
  name: string;
  icon: string | null;
  count: number;
}

interface TagOption {
  id: string;
  slug: string;
  name: string;
  color: string | null;
  group: string;
}

interface AssetItem {
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

interface MarketplaceResponse {
  data: AssetItem[];
  pagination: { page: number; limit: number; total: number; pages: number };
  filters: {
    asset_types: AssetTypeOption[];
    divisions: { slug: string; count: number }[];
    tags: TagOption[];
  };
}

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL state
  const urlSearch = searchParams.get("search") ?? "";
  const urlAssetType = searchParams.get("asset_type");
  const urlDivision = searchParams.get("division");
  const urlFeatured = searchParams.get("featured") === "true";
  const urlTags = searchParams.get("tags");
  const urlPage = parseInt(searchParams.get("page") ?? "1", 10);

  const [searchInput, setSearchInput] = useState(urlSearch);
  const [data, setData] = useState<MarketplaceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync search input when URL changes (e.g. browser back/forward)
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  const activeAssetType = urlAssetType;
  const activeTags = urlTags ? urlTags.split(",").filter(Boolean) : [];

  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (urlSearch) params.set("search", urlSearch);
        if (urlAssetType) params.set("asset_type", urlAssetType);
        if (urlDivision) params.set("division", urlDivision);
        if (urlFeatured) params.set("featured", "true");
        if (urlTags) params.set("tags", urlTags);
        params.set("page", String(urlPage));
        params.set("limit", "24");

        const res = await fetch(
          `/api/marketplace/assets?${params.toString()}`,
          { signal }
        );
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    },
    [urlSearch, urlAssetType, urlDivision, urlFeatured, urlTags, urlPage]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  // Update URL search params
  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    // Reset to page 1 when filters change (unless explicitly changing page)
    if (!("page" in updates)) {
      params.delete("page");
    }
    router.push(`/marketplace?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput.trim() || null });
  };

  const handleFilterChange = (filters: {
    asset_type: string | null;
    tags: string[];
    division: string | null;
    featured: boolean;
  }) => {
    updateParams({
      asset_type: filters.asset_type,
      division: filters.division,
      tags: filters.tags.length > 0 ? filters.tags.join(",") : null,
      featured: filters.featured ? "true" : null,
    });
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: String(newPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    router.push("/marketplace");
  };

  const totalPages = data?.pagination.pages ?? 0;
  const totalCount = data?.pagination.total ?? 0;

  return (
    <div className="space-y-8">
      {/* ─── Hero section — visible on first visit (no active filters/results) ─── */}
      <div
        className={`relative overflow-hidden rounded-2xl border px-8 py-14 text-center transition-all duration-700 ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-default)",
          boxShadow:
            "0 0 80px rgba(255,77,77,0.03), inset 0 1px 0 rgba(255,255,255,0.02)",
        }}
      >
        {/* Hero ambient glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 60% at 50% 30%, rgba(255,77,77,0.06) 0%, transparent 70%)",
          }}
        />

        {/* Icon */}
        <div className="relative mx-auto mb-5 inline-flex">
          <div
            className="absolute inset-0 rounded-2xl blur-md opacity-25"
            style={{ backgroundColor: "var(--accent)" }}
          />
          <div
            className="relative flex h-16 w-16 items-center justify-center rounded-2xl border"
            style={{
              backgroundColor: "var(--accent-muted)",
              borderColor: "rgba(255,77,77,0.15)",
            }}
          >
            <Package className="h-8 w-8" style={{ color: "var(--accent)" }} />
          </div>
        </div>

        {/* Title */}
        <h1
          className="relative text-[2rem] font-black uppercase leading-none tracking-[0.12em] sm:text-[2.5rem]"
          style={{
            color: "var(--text-primary)",
            textShadow: "0 0 60px rgba(255,77,77,0.12)",
          }}
        >
          Marketplace
        </h1>

        {/* Subtitle */}
        <div className="relative mt-3 flex items-center justify-center gap-3">
          <div
            className="h-px w-10"
            style={{
              background: "linear-gradient(90deg, transparent, var(--accent))",
            }}
          />
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.3em]"
            style={{ color: "var(--accent)" }}
          >
            Game Asset Store
          </p>
          <div
            className="h-px w-10"
            style={{
              background: "linear-gradient(90deg, var(--accent), transparent)",
            }}
          />
        </div>

        {/* Description */}
        <p
          className="relative mx-auto mt-4 max-w-lg text-sm leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          Browse and discover production-ready game assets — 3D models,
          textures, sounds, UI kits, and more from the ReA3 studio library.
        </p>

        {/* Stats hint */}
        {!loading && data && (
          <p
            className="relative mt-5 text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--text-secondary)" }}
          >
            {totalCount} asset{totalCount !== 1 ? "s" : ""} available
          </p>
        )}
      </div>

      {/* ─── Search bar ─── */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search
          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          type="text"
          placeholder="Search by name, description, or tags..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm transition-all duration-200 placeholder:text-[var(--text-muted)]"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderColor: "var(--border-default)",
            color: "var(--text-primary)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--accent)";
            e.target.style.boxShadow = "0 0 0 2px rgba(255,77,77,0.08)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--border-default)";
            e.target.style.boxShadow = "none";
          }}
        />
      </form>

      {/* Error banner */}
      {error && (
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
      )}

      {/* Filter bar */}
      {data && (
        <FilterSidebar
          assetTypes={data.filters.asset_types}
          tags={data.filters.tags}
          divisions={data.filters.divisions}
          activeFilters={{
            asset_type: activeAssetType,
            tags: activeTags,
            division: urlDivision ?? null,
            featured: urlFeatured,
          }}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Loading state */}
      {loading && (
        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          aria-hidden="true"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && data && data.data.length === 0 && (
        <div
          className="relative overflow-hidden rounded-xl border border-dashed px-8 py-20 text-center"
          style={{
            borderColor: "var(--border-default)",
            backgroundColor: "var(--bg-surface)",
          }}
        >
          {/* Empty state glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 40% 50% at 50% 50%, rgba(255,77,77,0.03) 0%, transparent 70%)",
            }}
          />

          <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <Package className="h-7 w-7" style={{ color: "var(--text-muted)" }} />
          </div>
          <p
            className="relative text-sm font-bold uppercase tracking-wider"
            style={{ color: "var(--text-primary)" }}
          >
            No assets found
          </p>
          <p
            className="relative mt-1.5 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Try adjusting your search terms or clearing the active filters.
          </p>
          <button
            onClick={clearFilters}
            className="relative mt-5 inline-flex items-center justify-center rounded-lg border px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200"
            style={{
              borderColor: "var(--accent)",
              color: "var(--accent)",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--accent-muted)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Product grid */}
      {!loading && data && data.data.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.data.map((asset) => (
            <ProductCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4 pb-2">
          <button
            onClick={() => handlePageChange(urlPage - 1)}
            disabled={urlPage <= 1}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30"
            style={{
              borderColor: "var(--border-default)",
              color: "var(--text-secondary)",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              if (urlPage > 1) {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.color = "var(--accent)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-default)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <ArrowLeft className="h-3 w-3" />
            Previous
          </button>

          {/* Page indicator */}
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Page{" "}
            <span style={{ color: "var(--text-primary)" }}>{urlPage}</span>
            {" "}of{" "}
            <span style={{ color: "var(--text-primary)" }}>{totalPages}</span>
          </span>

          <button
            onClick={() => handlePageChange(urlPage + 1)}
            disabled={urlPage >= totalPages}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30"
            style={{
              borderColor: "var(--border-default)",
              color: "var(--text-secondary)",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              if (urlPage < totalPages) {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.color = "var(--accent)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-default)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            Next
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
