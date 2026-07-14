"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Puzzle,
  Package,
  Rocket,
  Clock,
  Plus,
  Settings2,
  Tag,
  ArrowRight,
  Hexagon,
  Sparkles,
} from "lucide-react";
import { StatCard, ErrorBanner, SkeletonCard } from "@/components/ui";

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

  const statItems = [
    {
      label: "Asset Types",
      value: stats?.assetTypes ?? "—",
      icon: <Puzzle size={20} />,
      description: "Configured categories",
      href: "/asset-types",
    },
    {
      label: "Total Assets",
      value: stats?.totalAssets ?? "—",
      icon: <Package size={20} />,
      description: "Across all types",
      href: "/assets",
    },
    {
      label: "Published",
      value: stats?.published ?? "—",
      icon: <Rocket size={20} />,
      description: "Live on marketplace",
      href: "/marketplace",
    },
    {
      label: "In Review",
      value: stats?.inReview ?? "—",
      icon: <Clock size={20} />,
      description: "Awaiting approval",
      href: "/assets?status=in_review",
    },
  ];

  const quickActions = [
    {
      href: "/assets/new",
      icon: <Plus size={20} />,
      label: "New Asset",
      description: "Upload a new asset to the library",
      accent: true,
    },
    {
      href: "/asset-types",
      icon: <Puzzle size={20} />,
      label: "Asset Types",
      description: "Define custom schemas and fields",
      accent: false,
    },
    {
      href: "/tags",
      icon: <Tag size={20} />,
      label: "Tag Groups",
      description: "Organize assets with tags",
      accent: false,
    },
    {
      href: "/pipelines",
      icon: <Settings2 size={20} />,
      label: "Pipelines",
      description: "Automate asset processing",
      accent: false,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero header */}
      <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent-muted)] text-[var(--accent)]">
                <Hexagon size={14} />
              </span>
              <span className="text-xs font-medium text-[var(--text-muted)]">Asset Manager</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-[var(--text-muted)]">
              Asset management overview for your studio. Track, organize, and publish your game assets.
            </p>
          </div>

          <Link
            href="/assets/new"
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] active:scale-[0.97] sm:px-5 sm:py-3"
          >
            <Plus size={18} />
            <span>New Asset</span>
          </Link>
        </div>
      </section>

      {/* Error banner */}
      {loadError && (
        <ErrorBanner
          message={loadError}
          onDismiss={() => { setLoadError(null); }}
          onRetry={() => { setLoadError(null); setLoading(true); window.location.reload(); }}
        />
      )}

      {/* Stats grid */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Dashboard stats">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : statItems.map((stat) => (
              <div key={stat.label} className="animate-fade-in">
                <StatCard
                  label={stat.label}
                  value={stat.value}
                  icon={stat.icon}
                  description={stat.description}
                  href={stat.href}
                />
              </div>
            ))}
      </section>

      {/* Quick actions */}
      <section>
        <div className="mb-3 flex items-center gap-2 px-0.5">
          <Sparkles size={14} className="text-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.label}
              href={action.href}
              icon={action.icon}
              label={action.label}
              description={action.description}
              accent={action.accent}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function QuickActionCard({
  href,
  icon,
  label,
  description,
  accent,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  accent: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-sm transition-all hover:border-[var(--border-active)] hover:shadow active:scale-[0.98]"
    >
      <span
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border ${
          accent
            ? "border-[var(--accent-border)] bg-[var(--accent-muted)] text-[var(--accent)]"
            : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-muted)]"
        }`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
        <p className="truncate text-xs text-[var(--text-muted)]">{description}</p>
      </div>
      <ArrowRight
        size={16}
        className="flex-shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--text-primary)]"
        aria-hidden="true"
      />
    </Link>
  );
}
