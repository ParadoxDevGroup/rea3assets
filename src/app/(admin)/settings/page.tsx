"use client";

import { PageHeader, Card, CardBody, CardHeader } from "@/components/ui";

// ---------------------------------------------------------------------------
// General Settings page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage general application settings."
      />

      <Card className="border-[var(--border-default)]">
        <CardHeader>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
            Application
          </h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <InfoRow label="Version" value="0.1.0" />
          <InfoRow label="Environment" value={process.env.NODE_ENV ?? "development"} />
          <InfoRow label="Database" value="PostgreSQL (rea3_assets)" />
          <InfoRow label="DB Status" value="See connection indicator below" />
        </CardBody>
      </Card>

      <Card className="border-[var(--border-default)]">
        <CardHeader>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
            Asset Manager
          </h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <InfoRow label="Asset Types" value="Configurable via Asset Types page" />
          <InfoRow label="Custom Fields" value="14 field types supported" />
          <InfoRow label="Pipeline" value="Coming in a later release" />
          <InfoRow label="Marketplace" value="Coming in a later release" />
        </CardBody>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 last:border-0 last:pb-0">
      <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
      <span className="text-sm text-[var(--text-primary)]">{value}</span>
    </div>
  );
}
