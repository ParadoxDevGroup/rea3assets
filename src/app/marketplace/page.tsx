"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ArrowLeft, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { FilterSidebar } from "@/components/marketplace/FilterSidebar";
import { ErrorBanner, Skeleton } from "@/components/ui";

// ---------------------------------------------------------------------------
// Marketplace listing page — /marketplace
// Fetches from /api/marketplace/assets with URL-driven filters
// Wrapped in Suspense to satisfy Next.js useSearchParams requirement
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
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wider text-[var(--text-primary)]">
          Marketplace
        </h1>
        <Skeleton className="mt-1 h-4 w-48" />
      </div>
      <Skeleton className="h-10 w-full rounded-md" />
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
    divisions: string[];
    tags: TagOption[];
  };
}

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL state
  const urlSearch = searchParams.get("search") ?? "";
  const urlAssetType = searchParams.get("asset_type");
  const urlTags = searchParams.get("tags");
  const urlPage = parseInt(searchParams.get("page") ?? "1", 10);

  const [searchInput, setSearchInput] = useState(urlSearch);
  const [data, setData] = useState<MarketplaceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync search input when URL changes (e.g. browser back/forward)
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  const activeAssetType = urlAssetType;
  const activeTags = urlTags ? urlTags.split(",").filter(Boolean) : [];

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (urlSearch) params.set("search", urlSearch);
      if (urlAssetType) params.set("asset_type", urlAssetType);
      if (urlTags) params.set("tags", urlTags);
      params.set("page", String(urlPage));
      params.set("limit", "24");

      const res = await fetch(`/api/marketplace/assets?${params.toString()}`, { signal });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [urlSearch, urlAssetType, urlTags, urlPage]);

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
  }) => {
    updateParams({
      asset_type: filters.asset_type,
      tags: filters.tags.length > 0 ? filters.tags.join(",") : null,
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
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wider text-[var(--text-primary)]">
          Marketplace
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {loading ? <Skeleton className="inline-block h-4 w-32" /> : `${totalCount} asset${totalCount !== 1 ? "s" : ""} available`}
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Search assets..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)] py-2 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </form>

      {/* Error banner */}
      {error && (
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
      )}]

      {/* Filter bar */}
      {data && (
        <FilterSidebar
          assetTypes={data.filters.asset_types}
          tags={data.filters.tags}
          activeFilters={{
            asset_type: activeAssetType,
            tags: activeTags,
          }}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && data && data.data.length === 0 && (
        <div
          className="rounded-lg border border-dashed px-8 py-16 text-center"
          style={{
            borderColor: "var(--border-default)",
            backgroundColor: "var(--bg-surface)",
          }}
        >
          <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
            No assets found
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Try adjusting your search or filters.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 inline-flex items-center justify-center rounded-md border border-[var(--border-default)] bg-transparent px-4 py-2 text-sm font-medium uppercase tracking-wider text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]"
          >
            Clear filters
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
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => handlePageChange(urlPage - 1)}
            disabled={urlPage <= 1}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-default)] bg-transparent px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft className="h-3 w-3" />
            Previous
          </button>
          <span className="text-xs text-[var(--text-muted)]">
            Page {urlPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(urlPage + 1)}
            disabled={urlPage >= totalPages}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-default)] bg-transparent px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
