"use client";

import { useState } from "react";
import {
  PageHeader,
  Button,
  Card,
  CardBody,
  Badge,
  EmptyState,
  Input,
} from "@/components/ui";

// ---------------------------------------------------------------------------
// Asset Types list page — the core admin surface
// ---------------------------------------------------------------------------

// Mock data — will be replaced with API calls
const MOCK_TYPES = [
  {
    id: "1",
    slug: "character-model",
    name: "Character Model",
    description: "3D character models with rigging and animation support",
    icon: "🧑‍🎨",
    division: "vault_product",
    is_internal: true,
    is_public: true,
    field_count: 4,
    asset_count: 12,
    sort_order: 0,
  },
  {
    id: "2",
    slug: "environment-asset",
    name: "Environment Asset",
    description: "3D environment pieces — buildings, props, terrain",
    icon: "🏔️",
    division: "vault_product",
    is_internal: true,
    is_public: true,
    field_count: 4,
    asset_count: 8,
    sort_order: 1,
  },
  {
    id: "3",
    slug: "sound-effect",
    name: "Sound Effect",
    description: "Audio clips — SFX, ambient, UI sounds",
    icon: "🔊",
    division: "vault_product",
    is_internal: true,
    is_public: false,
    field_count: 4,
    asset_count: 0,
    sort_order: 2,
  },
  {
    id: "4",
    slug: "ui-component",
    name: "UI Component",
    description: "Roblox UI kits, HUD elements, menus",
    icon: "🖥️",
    division: "vault_product",
    is_internal: true,
    is_public: true,
    field_count: 3,
    asset_count: 5,
    sort_order: 3,
  },
];

const DIVISION_LABELS: Record<string, string> = {
  vault_product: "Vault",
  vault_service: "Vault Service",
  shop_product: "Shop",
  shop_service: "Shop Service",
  community: "Community",
};

export default function AssetTypesPage() {
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredTypes = MOCK_TYPES.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Types"
        subtitle="Define what kinds of assets exist. Each type has custom fields, validation rules, and pipeline config."
        action={
          <Button onClick={() => setShowCreateModal(true)}>
            + New Type
          </Button>
        }
      />

      {/* Search + filters */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search types..."
          value={search}
          onChange={setSearch}
          className="max-w-sm flex-1"
        />
        <div className="flex items-center gap-2">
          <Badge variant="muted">{filteredTypes.length} types</Badge>
        </div>
      </div>

      {/* Types grid */}
      {filteredTypes.length === 0 ? (
        <EmptyState
          icon="🧩"
          title="No asset types yet"
          description="Create your first asset type to start defining what kinds of assets your studio manages."
          action={
            <Button onClick={() => setShowCreateModal(true)}>
              + Create Asset Type
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTypes.map((type) => (
            <AssetTypeCard key={type.id} type={type} />
          ))}
        </div>
      )}

      {/* Create modal placeholder */}
      {showCreateModal && (
        <CreateTypeModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Asset Type Card
// ---------------------------------------------------------------------------

function AssetTypeCard({ type }: { type: (typeof MOCK_TYPES)[0] }) {
  return (
    <Card hover href={`/asset-types/${type.slug}`} className="border-[var(--border-default)]">
      <CardBody>
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">
              {type.icon}
            </span>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                {type.name}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {type.slug}
              </p>
            </div>
          </div>
          <Badge variant="accent" size="sm">
            {DIVISION_LABELS[type.division] ?? type.division}
          </Badge>
        </div>

        {/* Description */}
        <p className="mt-3 text-sm text-[var(--text-secondary)] line-clamp-2">
          {type.description}
        </p>

        {/* Stats row */}
        <div
          className="mt-4 flex items-center gap-4 border-t pt-3"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <span className="text-xs text-[var(--text-muted)]">
            <span className="font-medium text-[var(--text-secondary)]">
              {type.field_count}
            </span>{" "}
            fields
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            <span className="font-medium text-[var(--text-secondary)]">
              {type.asset_count}
            </span>{" "}
            assets
          </span>
          <div className="flex-1" />
          {type.is_public && (
            <Badge variant="success" size="sm">
              Public
            </Badge>
          )}
          {type.is_internal && (
            <Badge variant="muted" size="sm">
              Internal
            </Badge>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Create Type Modal (placeholder — will be wired to API in Phase 1)
// ---------------------------------------------------------------------------

function CreateTypeModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [division, setDivision] = useState("vault_product");

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-lg rounded-lg border p-6"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-default)",
        }}
      >
        <h2 className="text-lg font-bold uppercase tracking-wider text-[var(--text-primary)]">
          Create Asset Type
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Define a new category of assets. You can add custom fields after creation.
        </p>

        <div className="mt-6 space-y-4">
          <Input
            label="Name"
            placeholder="Character Model"
            value={name}
            onChange={handleNameChange}
          />
          <Input
            label="Slug"
            placeholder="character-model"
            value={slug}
            onChange={setSlug}
            helpText="Auto-generated from name. Lowercase alphanumeric with hyphens."
          />
          <Input
            label="Description"
            placeholder="3D character models with rigging and animation support"
            value={description}
            onChange={setDescription}
          />
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
              Division
            </label>
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="block w-full rounded-md border px-3 py-2 text-sm"
              style={{
                backgroundColor: "var(--bg-elevated)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
            >
              <option value="vault_product">Vault (Developer Assets)</option>
              <option value="shop_product">Shop (Consumer Products)</option>
              <option value="community">Community</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!name.trim() || !slug.trim()}
            onClick={() => {
              // TODO: POST to /api/asset-types
              onClose();
            }}
          >
            Create Type
          </Button>
        </div>
      </div>
    </div>
  );
}
