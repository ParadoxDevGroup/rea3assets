"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingCart,
  Tag,
  Package,
  Calendar,
  Layers,
} from "lucide-react";
import { Badge, Skeleton } from "@/components/ui";
import { Gallery } from "@/components/marketplace/Gallery";
import { formatBytes } from "@/lib/formatters";
import { renderFieldValue } from "@/components/MetadataField";

// ---------------------------------------------------------------------------
// Asset detail page — /marketplace/[slug]
// Clean corporate marketplace product detail.
// ---------------------------------------------------------------------------

interface FieldDef {
  slug: string;
  label: string;
  field_type: string;
  placeholder: string | null;
}

interface AssetTypeDetail {
  slug: string;
  name: string;
  icon: string | null;
  fields: FieldDef[];
}

interface AssetVersion {
  id: string;
  version: string;
  changelog: string | null;
  created_at: string;
  file_size: number | null;
  format: string | null;
}

interface AssetTag {
  tag: {
    id: string;
    name: string;
    color: string | null;
    group: { name: string };
  };
}

interface AssetDependency {
  id: string;
  dependency_type: string;
  notes: string | null;
  dependency: { id: string; name: string; slug: string };
}

interface AssetDetail {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sku: string | null;
  division: string;
  metadata: Record<string, unknown>;
  status: string;
  published_at: string | null;
  created_at: string;
  asset_type: AssetTypeDetail;
  thumbnails: Array<{
    id: string;
    url: string;
    purpose: string;
    width: number | null;
    height: number | null;
    format: string;
  }>;
  versions: AssetVersion[];
  tags: AssetTag[];
  dependencies: AssetDependency[];
}

export default function AssetDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [asset, setAsset] = useState<AssetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAsset = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/marketplace/assets/${slug}`, { signal });
        if (!res.ok) {
          if (res.status === 404) throw new Error("Asset not found");
          throw new Error(`API returned ${res.status}`);
        }
        const data = await res.json();
        setAsset(data);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    },
    [slug]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchAsset(controller.signal);
    return () => controller.abort();
  }, [fetchAsset]);

  // ─── Loading skeleton ───
  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-4 w-48" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-3">
            <Skeleton className="h-80 w-full rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-16 w-16 rounded-md" />
              <Skeleton className="h-16 w-16 rounded-md" />
              <Skeleton className="h-16 w-16 rounded-md" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-40 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  // ─── Error / 404 state ───
  if (error || !asset) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] px-8 py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)]">
          <Package className="h-7 w-7 text-[var(--text-muted)]" />
        </div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {error || "Asset not found"}
        </p>
        <p className="mt-1.5 text-sm text-[var(--text-muted)]">
          This asset may have been removed or the link is invalid.
        </p>
        <Link
          href="/marketplace"
          className="mt-5 inline-flex items-center justify-center rounded-lg border border-[var(--accent)] px-5 py-2.5 text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent-muted)]"
        >
          Back to marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ─── Breadcrumb ─── */}
      <nav className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
        <Link
          href="/marketplace"
          className="transition-colors hover:text-[var(--accent)]"
        >
          Marketplace
        </Link>
        <span className="opacity-40">/</span>
        <span className="text-[var(--text-secondary)]">
          {asset.asset_type.name}
        </span>
        <span className="opacity-40">/</span>
        <span className="text-[var(--text-primary)]">{asset.name}</span>
      </nav>

      {/* ─── Hero header ─── */}
      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            {/* Asset type */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-muted)]">
                <Package className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <Badge variant="accent" size="sm">
                {asset.asset_type.name}
              </Badge>
            </div>

            {/* Name */}
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              {asset.name}
            </h1>

            {/* Status & date */}
            <div className="flex flex-wrap items-center gap-2">
              {asset.published_at && <Badge variant="success">Published</Badge>}
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                <Calendar className="h-3 w-3" />
                {new Date(asset.published_at ?? asset.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Description */}
            {asset.description && (
              <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
                {asset.description}
              </p>
            )}
          </div>

          {/* Buy button — desktop */}
          <div className="flex-shrink-0 sm:pt-1">
            {asset.sku ? (
              <a
                href={
                  process.env.NEXT_PUBLIC_ERP_URL
                    ? `${process.env.NEXT_PUBLIC_ERP_URL}/checkout?sku=${asset.sku}`
                    : `#checkout-${asset.sku}`
                }
                onClick={
                  !process.env.NEXT_PUBLIC_ERP_URL
                    ? (e) => {
                        e.preventDefault();
                      }
                    : undefined
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
              >
                <ShoppingCart className="h-4 w-4" />
                Get This Asset
              </a>
            ) : (
              <span className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-6 py-3 text-sm font-medium text-[var(--text-muted)]">
                Contact for pricing
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─── Gallery + Info ─── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <Gallery thumbnails={asset.thumbnails} />

        {/* Quick info sidebar */}
        <div className="space-y-5">
          {/* Tags */}
          {asset.tags.length > 0 && (
            <div>
              <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                <Tag className="h-3 w-3" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {asset.tags.map((t) => (
                  <span
                    key={t.tag.id}
                    className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium"
                    style={{
                      borderColor: t.tag.color ?? "var(--border-default)",
                      backgroundColor: t.tag.color
                        ? `${t.tag.color}1a`
                        : "var(--bg-elevated)",
                      color: t.tag.color ?? "var(--text-secondary)",
                    }}
                  >
                    {t.tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick meta */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
            <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              <Layers className="h-3 w-3" />
              Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-[var(--text-muted)]">
                  Division
                </span>
                <span className="text-[var(--text-primary)]">
                  {asset.division.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-[var(--text-muted)]">
                  Slug
                </span>
                <span className="font-mono text-[var(--text-secondary)]">
                  {asset.slug}
                </span>
              </div>
              {asset.published_at && (
                <div className="flex justify-between">
                  <span className="font-medium text-[var(--text-muted)]">
                    Published
                  </span>
                  <span className="text-[var(--text-primary)]">
                    {new Date(asset.published_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              {asset.versions.length > 0 && (
                <div className="flex justify-between">
                  <span className="font-medium text-[var(--text-muted)]">
                    Latest version
                  </span>
                  <span className="font-mono font-semibold text-[var(--accent)]">
                    v{asset.versions[0]!.version}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* CTA — mobile */}
          <div className="lg:hidden">
            {asset.sku ? (
              <a
                href={
                  process.env.NEXT_PUBLIC_ERP_URL
                    ? `${process.env.NEXT_PUBLIC_ERP_URL}/checkout?sku=${asset.sku}`
                    : `#checkout-${asset.sku}`
                }
                onClick={
                  !process.env.NEXT_PUBLIC_ERP_URL
                    ? (e) => {
                        e.preventDefault();
                      }
                    : undefined
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
              >
                <ShoppingCart className="h-4 w-4" />
                Get This Asset
              </a>
            ) : (
              <span className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] py-3 text-sm font-medium text-[var(--text-muted)]">
                Contact for pricing
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─── Divider ─── */}
      <div className="h-px bg-[var(--border-subtle)]" />

      {/* ─── Metadata section ─── */}
      {asset.asset_type.fields.length > 0 && (
        <section>
          <h2 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
            Specifications
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {asset.asset_type.fields.map((field) => {
              const value = asset.metadata[field.slug];
              return (
                <div
                  key={field.slug}
                  className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 transition-colors hover:border-[var(--border-active)]"
                >
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    {field.label}
                  </p>
                  <div className="text-sm text-[var(--text-primary)]">
                    {renderFieldValue(field.field_type, value)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── Versions section ─── */}
      {asset.versions.length > 0 && (
        <section>
          <h2 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
            Versions
          </h2>
          <div className="space-y-2">
            {asset.versions.map((v, idx) => (
              <div
                key={v.id}
                className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 transition-colors hover:border-[var(--border-active)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono text-sm font-semibold ${
                        idx === 0
                          ? "text-[var(--accent)]"
                          : "text-[var(--text-primary)]"
                      }`}
                    >
                      v{v.version}
                    </span>
                    {idx === 0 && (
                      <Badge variant="accent" size="sm">
                        Latest
                      </Badge>
                    )}
                    {v.format && (
                      <Badge variant="muted" size="sm">
                        {v.format}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">
                    {new Date(v.created_at).toLocaleDateString()}
                  </span>
                </div>
                {v.changelog && (
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {v.changelog}
                  </p>
                )}
                {v.file_size && (
                  <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                    Size: {formatBytes(Number(v.file_size))}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Dependencies section ─── */}
      {asset.dependencies.length > 0 && (
        <section>
          <h2 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
            Dependencies
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {asset.dependencies.map((dep) => (
              <div
                key={dep.id}
                className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 transition-colors hover:border-[var(--border-active)]"
              >
                <div className="flex items-center justify-between">
                  <Link
                    href={`/marketplace/${dep.dependency.slug}`}
                    className="text-sm font-semibold text-[var(--accent)] hover:underline"
                  >
                    {dep.dependency.name}
                  </Link>
                  <Badge variant="muted" size="sm">
                    {dep.dependency_type.replace(/_/g, " ")}
                  </Badge>
                </div>
                {dep.notes && (
                  <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                    {dep.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Back link ─── */}
      <div className="pb-4">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to marketplace
        </Link>
      </div>
    </div>
  );
}
