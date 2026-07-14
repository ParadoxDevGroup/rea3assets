"use client";

import Link from "next/link";
import { StatCard, PageHeader, ErrorBanner, SkeletonCard } from "@/components/ui";
import { Puzzle, Package, Rocket, Clock, Plus, Settings2, Tag, ArrowRight } from "lucide-react";

import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [stats, setStats] = useState<{
    assetTypes: number;
    totalAssets: number;
    published: number;
    inReview: number;
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const [typesRes, assetsRes, publishedRes, reviewRes] = await Promise.all([
          fetch("/api/asset-types", { signal: controller.signal }),
          fetch("/api/assets?limit=1", { signal: controller.signal }),
          fetch("/api/assets?status=published&limit=1", { signal: controller.signal }),
          fetch("/api/assets?status=in_review&limit=1", { signal: controller.signal }),
        ]);

        if (typesRes.status >= 500 || assetsRes.status >= 500) {
          setLoadError("Database unavailable — ensure PostgreSQL is running and ASSET_DB_URL is configured in .env");
          return;
        }
        if (!typesRes.ok || !assetsRes.ok) throw new Error("Failed to load stats");
        const types = await typesRes.json();
        const assetsData = await assetsRes.json();
        const publishedData = await publishedRes.json();
        const reviewData = await reviewRes.json();
        setStats({
          assetTypes: types.length,
          totalAssets: assetsData.pagination.total,
          published: publishedData.pagination.total,
          inReview: reviewData.pagination.total,
        });
      } catch (err) {
        setLoadError(String(err));
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Asset management overview for your studio."
      />

      {/* Error banner */}
      {loadError && (
        <ErrorBanner
          message={loadError}
          onDismiss={() => { setLoadError(null); }}
          onRetry={() => { setLoadError(null); setLoading(true); window.location.reload(); }}
        />
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              label="Asset Types"
              value={stats?.assetTypes ?? "—"}
              icon={<Puzzle size={20} />}
              description="Configured categories"
              href="/asset-types"
            />
            <StatCard
              label="Total Assets"
              value={stats?.totalAssets ?? "—"}
              icon={<Package size={20} />}
              description="Across all types"
              href="/assets"
            />
            <StatCard
              label="Published"
              value={stats?.published ?? "—"}
              icon={<Rocket size={20} />}
              description="Live on marketplace"
              href="/marketplace"
            />
            <StatCard
              label="In Review"
              value={stats?.inReview ?? "—"}
              icon={<Clock size={20} />}
              description="Awaiting approval"
              href="/assets?status=in_review"
            />
          </>
        )}
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <QuickAction
          href="/assets/new"
          icon={<Plus size={20} />}
          label="New Asset"
          description="Upload a new asset to the library"
        />
        <QuickAction
          href="/asset-types"
          icon={<Puzzle size={20} />}
          label="Asset Types"
          description="Define custom schemas and fields"
        />
        <QuickAction
          href="/tags"
          icon={<Tag size={20} />}
          label="Tag Groups"
          description="Organize assets with tags"
        />
        <QuickAction
          href="/pipelines"
          icon={<Settings2 size={20} />}
          label="Pipelines"
          description="Automate asset processing"
        />
      </div>

      {/* Getting started guide (only when no data) */}
      {!loading && stats && stats.totalAssets === 0 && (
        <div
          className="rounded-lg border border-dashed px-8 py-12 text-center"
          style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-surface)" }}
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
            Get Started
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Start by creating an{" "}
            <Link href="/asset-types" className="underline" style={{ color: "var(--accent)" }}>
              Asset Type
            </Link>{" "}
            to define your first asset category, then add assets of that type.
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick Action Card — clickable shortcut card
// ---------------------------------------------------------------------------

function QuickAction({ href, icon, label, description }: { href: string; icon: React.ReactNode; label: string; description: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3.5 transition-all duration-200 hover:border-[var(--border-active)] hover:bg-[var(--bg-elevated)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
    >
      <span className="text-[var(--accent)] transition-transform duration-200 group-hover:scale-110" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        <p className="truncate text-xs text-[var(--text-muted)]">{description}</p>
      </div>
      <ArrowRight
        size={16}
        className="text-[var(--text-muted)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--text-primary)]"
        aria-hidden="true"
      />
    </Link>
  );
}
