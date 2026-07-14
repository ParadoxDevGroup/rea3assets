"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ArrowLeft, ArrowRight, Package } from "lucide-react";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { FilterSidebar } from "@/components/marketplace/FilterSidebar";
import { ErrorBanner, Skeleton } from "@/components/ui";

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

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
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
      {/* Hero section */}
      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-muted)] text-[var(--accent)]">
          <Package size={32} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          Marketplace
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--text-muted)]">
          Browse and discover production-ready game assets — 3D models, textures, sounds, UI kits, and more from the ReA3 studio library.
        </p>
        {!loading && data && (
          <p className="mt-4 text-sm font-medium text-[var(--text-secondary)]">
            {totalCount} asset{totalCount !== 1 ? "s" : ""} available
          </p>
        )}
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search
          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Search by name, description, or tags..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)]"
        />
      </form>

      {/* Error banner */}
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

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
        <div className="rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] px-8 py-20 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)]">
            <Package className="h-7 w-7 text-[var(--text-muted)]" />
          </div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            No assets found
          </p>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">
            Try adjusting your search terms or clearing the active filters.
          </p>
          <button
            onClick={clearFilters}
            className="mt-5 inline-flex items-center justify-center rounded-lg border border-[var(--accent)] px-5 py-2.5 text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent-muted)]"
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
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-active)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          <span className="text-sm text-[var(--text-muted)]">
            Page <span className="font-medium text-[var(--text-primary)]">{urlPage}</span> of{" "}
            <span className="font-medium text-[var(--text-primary)]">{totalPages}</span>
          </span>

          <button
            onClick={() => handlePageChange(urlPage + 1)}
            disabled={urlPage >= totalPages}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-active)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
