"use client";

// ---------------------------------------------------------------------------
// Badge + StatusBadge — Visual label primitives
// ---------------------------------------------------------------------------

export type BadgeVariant = "default" | "accent" | "success" | "warning" | "error" | "muted";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

export function Badge({ children, variant = "default", size = "sm" }: BadgeProps) {
  const variants: Record<string, string> = {
    default: "border-[var(--border-default)] text-[var(--text-secondary)]",
    accent: "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-muted)]",
    success: "border-[var(--status-approved)] text-[var(--status-approved)] bg-[rgba(34,197,94,0.15)]",
    warning: "border-[var(--status-review)] text-[var(--status-review)] bg-[rgba(245,158,11,0.15)]",
    error: "border-[var(--status-deprecated)] text-[var(--status-deprecated)] bg-[rgba(239,68,68,0.15)]",
    muted: "border-[var(--border-subtle)] text-[var(--text-muted)]",
  };

  const sizes: Record<string, string> = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium uppercase tracking-wider ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
}

// --- Status Badge ---

const STATUS_CONFIG: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
  draft: { label: "Draft", variant: "muted" },
  in_review: { label: "In Review", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  published: { label: "Published", variant: "accent" },
  deprecated: { label: "Deprecated", variant: "error" },
  archived: { label: "Archived", variant: "muted" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: "default" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
