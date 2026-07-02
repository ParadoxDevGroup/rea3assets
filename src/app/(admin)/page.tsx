import { StatCard, PageHeader } from "@/components/ui";

// ---------------------------------------------------------------------------
// Dashboard — overview page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Asset management overview for your studio."
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Asset Types"
          value="—"
          icon="🧩"
          description="Configured categories"
        />
        <StatCard
          label="Total Assets"
          value="—"
          icon="📦"
          description="Across all types"
        />
        <StatCard
          label="Published"
          value="—"
          icon="🚀"
          description="Live on marketplace"
        />
        <StatCard
          label="In Review"
          value="—"
          icon="⏳"
          description="Awaiting approval"
        />
      </div>

      {/* Quick actions placeholder */}
      <div
        className="rounded-lg border border-dashed px-8 py-12 text-center"
        style={{
          borderColor: "var(--border-default)",
          backgroundColor: "var(--bg-surface)",
        }}
      >
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Dashboard data will populate once assets and asset types are created.
        </p>
        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
          Start by creating an{" "}
          <a
            href="/asset-types"
            className="underline"
            style={{ color: "var(--accent)" }}
          >
            Asset Type
          </a>{" "}
          to define your first asset category.
        </p>
      </div>
    </div>
  );
}
