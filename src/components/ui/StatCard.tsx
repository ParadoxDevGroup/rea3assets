"use client";

import Link from "next/link";
import { CardBody } from "./Card";

// ---------------------------------------------------------------------------
// StatCard — Dashboard metric card with icon, value, description, link
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  href?: string;
}

export function StatCard({ label, value, icon, description, href }: StatCardProps) {
  const content = (
    <CardBody>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-[var(--accent)] transition-transform duration-200 group-hover:scale-110" aria-hidden="true">
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            {label}
          </h3>
          <p className="mt-1 text-2xl font-bold text-[var(--text-primary)] tabular-nums">
            {value}
          </p>
          {description && (
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">{description}</p>
          )}
        </div>
      </div>
    </CardBody>
  );

  if (href) {
    return (
      <Link href={href} className="group block rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] transition-all duration-200 hover:border-[var(--border-active)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
        {content}
      </Link>
    );
  }

  return (
    <div className="group rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] transition-all duration-200 hover:border-[var(--border-active)]">
      {content}
    </div>
  );
}
