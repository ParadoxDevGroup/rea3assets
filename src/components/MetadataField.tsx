"use client";

import { Check, Star, Paperclip, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui";
import { formatBytes } from "@/lib/formatters";

// ---------------------------------------------------------------------------
// Shared metadata field value renderer
// ---------------------------------------------------------------------------
// Used by both the admin asset detail page and the marketplace detail page
// to render a metadata value based on its field_type.
// Extracted to eliminate duplication between the two pages.

export function renderFieldValue(fieldType: string, value: unknown): React.ReactNode {
  if (value === undefined || value === null) {
    return <span className="text-sm italic text-[var(--text-muted)]">Not set</span>;
  }

  switch (fieldType) {
    case "text":
    case "textarea":
      return <span className="text-sm text-[var(--text-primary)]">{String(value)}</span>;

    case "number":
      return <span className="text-lg font-mono font-semibold text-[var(--text-primary)]">{Number(value).toLocaleString()}</span>;

    case "boolean":
      return (
        <span
          className={`inline-flex items-center gap-1 text-sm ${
            value ? "text-[#22c55e]" : "text-[var(--text-muted)]"
          }`}
        >
          {value ? <><Check size={14} /> Yes</> : <>No</>}
        </span>
      );

    case "select":
      return <Badge>{String(value)}</Badge>;

    case "multi_select":
      return (
        <div className="flex flex-wrap gap-1">
          {(Array.isArray(value) ? value : []).map((v: string, i: number) => (
            <Badge key={i}>{v}</Badge>
          ))}
        </div>
      );

    case "date":
      try {
        const d = new Date(String(value));
        return <span className="text-sm text-[var(--text-primary)]">{d.toLocaleDateString()}</span>;
      } catch {
        return <span className="text-sm text-[var(--text-muted)]">{String(value)}</span>;
      }

    case "url":
      return (
        <a
          href={String(value)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm underline"
          style={{ color: "var(--accent)" }}
        >
          {String(value)}
          <ExternalLink className="h-3 w-3" />
        </a>
      );

    case "color":
      return (
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-4 w-4 rounded border"
            style={{
              backgroundColor: String(value),
              borderColor: "var(--border-default)",
            }}
          />
          <code className="text-xs text-[var(--text-muted)]">{String(value)}</code>
        </span>
      );

    case "tags":
      return (
        <div className="flex flex-wrap gap-1">
          {(Array.isArray(value) ? value : []).map((v: string, i: number) => (
            <Badge key={i} variant="default">{v}</Badge>
          ))}
        </div>
      );

    case "rating": {
      const stars = Math.min(Number(value), 5);
      return (
        <span className="inline-flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={16}
              className={i < stars ? "fill-[var(--accent)] text-[var(--accent)]" : "text-[var(--text-muted)]"}
            />
          ))}
        </span>
      );
    }

    case "richtext":
      return <span className="text-sm text-[var(--text-primary)]">{String(value).slice(0, 200)}{String(value).length > 200 ? "..." : ""}</span>;

    case "image":
    case "file":
      if (typeof value === "object" && value !== null && "filename" in value) {
        const fv = value as { filename: string; size_bytes?: number };
        return (
          <span className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Paperclip size={14} /> {fv.filename}
            {fv.size_bytes && (
              <span className="text-xs text-[var(--text-muted)]">
                ({formatBytes(fv.size_bytes)})
              </span>
            )}
          </span>
        );
      }
      return <span className="text-sm text-[var(--text-muted)]">{JSON.stringify(value)}</span>;

    default:
      return <span className="text-sm text-[var(--text-muted)]">{JSON.stringify(value)}</span>;
  }
}
