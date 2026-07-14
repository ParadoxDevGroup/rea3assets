"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Tag } from "lucide-react";
import { Badge, Card, CardBody, ErrorBanner, Skeleton } from "@/components/ui";
import { Gallery } from "@/components/marketplace/Gallery";
import { formatBytes } from "@/lib/formatters";
import { renderFieldValue } from "@/components/MetadataField";

// ---------------------------------------------------------------------------
// Asset detail page — /marketplace/[slug]
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

  const fetchAsset = useCallback(async (signal?: AbortSignal) => {
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
  }, [slug]);

  useEffect(() => {
    const controller = new AbortController();
    fetchAsset(controller.signal);
    return () => controller.abort();
  }, [fetchAsset]);

  // Loading state
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
            <div className="flex gap-2"><Skeleton className="h-5 w-24 rounded-full" /><Skeleton className="h-5 w-20 rounded-full" /></div>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-40 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  // Error / 404 state
  if (error || !asset) {
    return (
      <div className="space-y-4">
        <ErrorBanner message={error || "Asset not found"} />
        <div>
          <Link
            href="/marketplace"
            className="inline-flex items-center justify-center rounded-md border border-[var(--border-default)] bg-transparent px-4 py-2 text-sm font-medium uppercase tracking-wider text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]"
          >
            Back to marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
        <Link href="/marketplace" className="hover:text-[var(--text-primary)]">
          Marketplace
        </Link>
        <span>/</span>
        <span className="text-[var(--text-secondary)]">{asset.asset_type.name}</span>
        <span>/</span>
        <span className="text-[var(--text-primary)]">{asset.name}</span>
      </nav>

      {/* Top section: Gallery + Info */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <Gallery thumbnails={asset.thumbnails} />

        {/* Asset info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {asset.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="accent">{asset.asset_type.name}</Badge>
              {asset.published_at && (
                <Badge variant="success">Published</Badge>
              )}
            </div>
          </div>

          {asset.description && (
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              {asset.description}
            </p>
          )}

          {/* Tags */}
          {asset.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              {asset.tags.map((t) => (
                <span
                  key={t.tag.id}
                  className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider border-[var(--border-default)] text-[var(--text-secondary)]"
                  style={
                    t.tag.color
                      ? {
                          borderColor: t.tag.color,
                          backgroundColor: `${t.tag.color}1a`,
                          color: t.tag.color,
                        }
                      : undefined
                  }
                >
                  {t.tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Buy button */}
          <div className="pt-2">
            {asset.sku ? (
              <a
                href={process.env.NEXT_PUBLIC_ERP_URL
                  ? `${process.env.NEXT_PUBLIC_ERP_URL}/checkout?sku=${asset.sku}`
                  : `#checkout-${asset.sku}`}
                onClick={!process.env.NEXT_PUBLIC_ERP_URL ? (e) => { e.preventDefault(); } : undefined}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[var(--accent-hover)]"
              >
                <ShoppingCart className="h-4 w-4" />
                Get This Asset
              </a>
            ) : (
              <span className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--border-default)] bg-transparent px-6 py-3 text-sm font-medium uppercase tracking-wider text-[var(--text-muted)]">
                Contact for pricing
              </span>
            )}
          </div>

          {/* Quick metadata */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div>
              <span className="font-medium uppercase tracking-wider text-[var(--text-muted)]">
                Division
              </span>
              <p className="mt-0.5 text-[var(--text-secondary)]">
                {asset.division.replace(/_/g, " ")}
              </p>
            </div>
            <div>
              <span className="font-medium uppercase tracking-wider text-[var(--text-muted)]">
                Slug
              </span>
              <p className="mt-0.5 font-mono text-[var(--text-secondary)]">{asset.slug}</p>
            </div>
            {asset.published_at && (
              <div>
                <span className="font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Published
                </span>
                <p className="mt-0.5 text-[var(--text-secondary)]">
                  {new Date(asset.published_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata section */}
      {asset.asset_type.fields.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
            Details
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {asset.asset_type.fields.map((field) => {
              const value = asset.metadata[field.slug];
              return (
                <Card key={field.slug} className="border-[var(--border-default)]">
                  <CardBody className="py-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                      {field.label}
                    </p>
                    <div className="mt-1">
                      {renderFieldValue(field.field_type, value)}
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Versions section */}
      {asset.versions.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
            Versions
          </h2>
          <div className="space-y-2">
            {asset.versions.map((v) => (
              <Card key={v.id} className="border-[var(--border-default)]">
                <CardBody className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-semibold text-[var(--text-primary)]">
                        v{v.version}
                      </span>
                      {v.format && (
                        <Badge variant="muted" size="sm">{v.format}</Badge>
                      )}
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(v.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {v.changelog && (
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">{v.changelog}</p>
                  )}
                  {v.file_size && (
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      Size: {formatBytes(Number(v.file_size))}
                    </p>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Dependencies section */}
      {asset.dependencies.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
            Dependencies
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {asset.dependencies.map((dep) => (
              <Card key={dep.id} className="border-[var(--border-default)]">
                <CardBody className="py-3">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/marketplace/${dep.dependency.slug}`}
                      className="text-sm font-medium text-[var(--accent)] hover:underline"
                    >
                      {dep.dependency.name}
                    </Link>
                    <Badge variant="muted" size="sm">
                      {dep.dependency_type.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  {dep.notes && (
                    <p className="mt-1 text-xs text-[var(--text-muted)]">{dep.notes}</p>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Back link */}
      <div className="border-t border-[var(--border-subtle)] pt-6">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to marketplace
        </Link>
      </div>
    </div>
  );
}


// ---------------------------------------------------------------------------
