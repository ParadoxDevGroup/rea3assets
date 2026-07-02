"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Input,
} from "@/components/ui";

// ---------------------------------------------------------------------------
// Asset Type detail page — edit type config + manage custom fields
// ---------------------------------------------------------------------------

// Mock data — will be replaced with API calls
const MOCK_TYPE = {
  id: "1",
  slug: "character-model",
  name: "Character Model",
  description: "3D character models with rigging and animation support",
  icon: "🧑‍🎨",
  division: "vault_product",
  is_internal: true,
  is_public: true,
  sort_order: 0,
  created_at: "2026-06-15T10:00:00Z",
  updated_at: "2026-07-01T14:30:00Z",
};

const MOCK_FIELDS = [
  {
    id: "f1",
    slug: "polygon_count",
    label: "Polygon Count",
    field_type: "number" as const,
    config: { min: 0, max: 100000, step: 100 },
    is_required: true,
    is_filterable: true,
    is_showcase: true,
    sort_order: 0,
  },
  {
    id: "f2",
    slug: "rig_type",
    label: "Rig Type",
    field_type: "select" as const,
    config: { options: ["R15", "Rthro", "Custom"] },
    is_required: true,
    is_filterable: true,
    is_showcase: true,
    sort_order: 1,
  },
  {
    id: "f3",
    slug: "animation_set",
    label: "Animation Set",
    field_type: "multi_select" as const,
    config: { options: ["walk", "run", "idle", "jump", "attack", "dance"] },
    is_required: false,
    is_filterable: false,
    is_showcase: false,
    sort_order: 2,
  },
  {
    id: "f4",
    slug: "texture_resolution",
    label: "Texture Resolution",
    field_type: "select" as const,
    config: { options: ["512", "1024", "2048", "4096"] },
    is_required: false,
    is_filterable: true,
    is_showcase: false,
    sort_order: 3,
  },
];

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: "Text",
  textarea: "Textarea",
  number: "Number",
  boolean: "Boolean",
  select: "Select",
  multi_select: "Multi-Select",
  date: "Date",
  url: "URL",
  image: "Image",
  file: "File",
  richtext: "Rich Text",
  tags: "Tags",
  color: "Color",
  rating: "Rating",
};

const FIELD_TYPE_ICONS: Record<string, string> = {
  text: "📝",
  textarea: "📄",
  number: "🔢",
  boolean: "✅",
  select: "📋",
  multi_select: "🏷️",
  date: "📅",
  url: "🔗",
  image: "🖼️",
  file: "📎",
  richtext: "📰",
  tags: "🏷️",
  color: "🎨",
  rating: "⭐",
};

export default function AssetTypeDetailPage() {
  const [activeTab, setActiveTab] = useState<"fields" | "settings">("fields");
  const [showAddField, setShowAddField] = useState(false);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <a href="/asset-types" className="hover:text-[var(--text-primary)]">
          Asset Types
        </a>
        <span>/</span>
        <span className="text-[var(--text-primary)]">{MOCK_TYPE.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <span className="text-4xl" aria-hidden="true">
            {MOCK_TYPE.icon}
          </span>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {MOCK_TYPE.name}
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {MOCK_TYPE.description}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <Badge variant="accent">{MOCK_TYPE.division.replace("_", " ")}</Badge>
              {MOCK_TYPE.is_public && <Badge variant="success">Public</Badge>}
              {MOCK_TYPE.is_internal && <Badge variant="muted">Internal</Badge>}
              <span className="text-xs text-[var(--text-muted)]">
                {MOCK_TYPE.slug}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 border-b"
        style={{ borderColor: "var(--border-default)" }}
      >
        <TabButton
          active={activeTab === "fields"}
          onClick={() => setActiveTab("fields")}
          label="Custom Fields"
          count={MOCK_FIELDS.length}
        />
        <TabButton
          active={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
          label="Settings"
        />
      </div>

      {/* Tab content */}
      {activeTab === "fields" && (
        <FieldsTab
          fields={MOCK_FIELDS}
          onAddField={() => setShowAddField(true)}
        />
      )}
      {activeTab === "settings" && <SettingsTab type={MOCK_TYPE} />}

      {/* Add field modal */}
      {showAddField && (
        <AddFieldModal onClose={() => setShowAddField(false)} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab button
// ---------------------------------------------------------------------------

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-3 text-sm font-medium uppercase tracking-wider transition-colors ${
        active ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
      }`}
    >
      {label}
      {count !== undefined && (
        <span className="ml-2 text-xs text-[var(--text-muted)]">{count}</span>
      )}
      {active && (
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ backgroundColor: "var(--accent)" }}
        />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Fields tab — the dynamic field builder
// ---------------------------------------------------------------------------

interface Field {
  id: string;
  slug: string;
  label: string;
  field_type: string;
  config: any;
  is_required: boolean;
  is_filterable: boolean;
  is_showcase: boolean;
  sort_order: number;
}

function FieldsTab({
  fields,
  onAddField,
}: {
  fields: Field[];
  onAddField: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">
          Define what metadata each asset of this type carries. Fields determine
          the upload form, validation rules, and marketplace display.
        </p>
        <Button size="sm" onClick={onAddField}>
          + Add Field
        </Button>
      </div>

      {/* Fields list */}
      <div className="space-y-2">
        {fields
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((field) => (
            <FieldRow key={field.id} field={field} />
          ))}
      </div>

      {/* Empty state */}
      {fields.length === 0 && (
        <div
          className="rounded-lg border border-dashed px-8 py-12 text-center"
          style={{
            borderColor: "var(--border-default)",
            backgroundColor: "var(--bg-surface)",
          }}
        >
          <p className="text-sm text-[var(--text-muted)]">
            No custom fields yet. Add fields to define what metadata this asset type carries.
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Field row — shows one field with its type, config summary, and actions
// ---------------------------------------------------------------------------

function FieldRow({ field }: { field: Field }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-[var(--border-default)]">
      <CardBody className="py-3">
        <div className="flex items-center gap-4">
          {/* Drag handle (placeholder) */}
          <span className="cursor-grab text-[var(--text-muted)]" aria-hidden="true">
            ⠿
          </span>

          {/* Field icon */}
          <span className="text-lg" aria-hidden="true">
            {FIELD_TYPE_ICONS[field.field_type] ?? "📝"}
          </span>

          {/* Field info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {field.label}
              </span>
              <code className="rounded px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]" style={{ backgroundColor: "var(--bg-elevated)" }}>
                {field.slug}
              </code>
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <Badge variant="default" size="sm">
                {FIELD_TYPE_LABELS[field.field_type] ?? field.field_type}
              </Badge>
              {field.is_required && (
                <Badge variant="warning" size="sm">Required</Badge>
              )}
              {field.is_filterable && (
                <Badge variant="success" size="sm">Filterable</Badge>
              )}
              {field.is_showcase && (
                <Badge variant="accent" size="sm">Showcase</Badge>
              )}
            </div>
          </div>

          {/* Config summary */}
          <div className="hidden text-right md:block">
            {field.config && (
              <ConfigSummary field={field} />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? "▲" : "▼"}
            </button>
            <button
              className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              aria-label="Edit field"
            >
              ✏️
            </button>
            <button
              className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
              aria-label="Delete field"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Expanded config details */}
        {expanded && field.config && (
          <div
            className="mt-3 rounded-md border p-3"
            style={{
              borderColor: "var(--border-subtle)",
              backgroundColor: "var(--bg-elevated)",
            }}
          >
            <h4 className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Configuration
            </h4>
            <pre className="mt-1 text-xs text-[var(--text-secondary)]">
              {JSON.stringify(field.config, null, 2)}
            </pre>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Config summary — compact display of field config
// ---------------------------------------------------------------------------

function ConfigSummary({ field }: { field: Field }) {
  if (!field.config) return null;

  switch (field.field_type) {
    case "number":
      return (
        <span className="text-xs text-[var(--text-muted)]">
          {field.config.min !== undefined && `min: ${field.config.min}`}
          {field.config.min !== undefined && field.config.max !== undefined && " · "}
          {field.config.max !== undefined && `max: ${field.config.max}`}
          {field.config.unit && ` ${field.config.unit}`}
        </span>
      );
    case "select":
    case "multi_select":
      return (
        <span className="text-xs text-[var(--text-muted)]">
          {field.config.options?.length ?? 0} options
        </span>
      );
    case "rating":
      return (
        <span className="text-xs text-[var(--text-muted)]">
          1–{field.config.max ?? 5} stars
        </span>
      );
    case "tags":
      return (
        <span className="text-xs text-[var(--text-muted)]">
          {field.config.max_tags ? `max ${field.config.max_tags} tags` : "unlimited"}
        </span>
      );
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Settings tab — edit type properties
// ---------------------------------------------------------------------------

function SettingsTab({ type }: { type: typeof MOCK_TYPE }) {
  return (
    <div className="space-y-6">
      <Card className="border-[var(--border-default)]">
        <CardHeader>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
            General
          </h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input label="Name" value={type.name} onChange={() => {}} />
          <Input label="Slug" value={type.slug} onChange={() => {}} helpText="Cannot be changed after creation." />
          <Input label="Description" value={type.description ?? ""} onChange={() => {}} />
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
              Division
            </label>
            <select
              value={type.division}
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
        </CardBody>
      </Card>

      <Card className="border-[var(--border-default)]">
        <CardHeader>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
            Visibility
          </h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <ToggleRow
            label="Internal Library"
            description="Show this asset type in the studio's internal asset library."
            checked={type.is_internal}
          />
          <ToggleRow
            label="Public Marketplace"
            description="List assets of this type on the public marketplace storefront."
            checked={type.is_public}
          />
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toggle row
// ---------------------------------------------------------------------------

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange?: (value: boolean) => void;
}) {
  const [enabled, setEnabled] = useState(checked);

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    onChange?.(next);
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        <p className="text-xs text-[var(--text-muted)]">{description}</p>
      </div>
      <button
        onClick={handleToggle}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          enabled ? "bg-[var(--accent)]" : "bg-[var(--bg-hover)]"
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add Field Modal
// ---------------------------------------------------------------------------

function AddFieldModal({ onClose }: { onClose: () => void }) {
  const [label, setLabel] = useState("");
  const [slug, setSlug] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [isRequired, setIsRequired] = useState(false);
  const [isFilterable, setIsFilterable] = useState(false);
  const [isShowcase, setIsShowcase] = useState(false);

  const handleLabelChange = (value: string) => {
    setLabel(value);
    setSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, ""),
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative z-10 w-full max-w-lg rounded-lg border p-6"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-default)",
        }}
      >
        <h2 className="text-lg font-bold uppercase tracking-wider text-[var(--text-primary)]">
          Add Field
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Define a custom metadata field for this asset type.
        </p>

        <div className="mt-6 space-y-4">
          <Input
            label="Label"
            placeholder="Polygon Count"
            value={label}
            onChange={handleLabelChange}
          />
          <Input
            label="Slug"
            placeholder="polygon_count"
            value={slug}
            onChange={setSlug}
            helpText="Auto-generated from label. Lowercase with underscores."
          />

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
              Field Type
            </label>
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value)}
              className="block w-full rounded-md border px-3 py-2 text-sm"
              style={{
                backgroundColor: "var(--bg-elevated)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
            >
              {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {FIELD_TYPE_ICONS[value]} {label}
                </option>
              ))}
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <ToggleRow
              label="Required"
              description="Must be filled before an asset can be saved."
              checked={isRequired}
              onChange={setIsRequired}
            />
            <ToggleRow
              label="Filterable"
              description="Show as a filter in the library and marketplace."
              checked={isFilterable}
              onChange={setIsFilterable}
            />
            <ToggleRow
              label="Showcase"
              description="Display on the marketplace product card."
              checked={isShowcase}
              onChange={setIsShowcase}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!label.trim() || !slug.trim()}
            onClick={() => {
              // TODO: POST to /api/asset-types/[slug]/fields
              onClose();
            }}
          >
            Add Field
          </Button>
        </div>
      </div>
    </div>
  );
}
