# DESIGN.md — ReA3 Asset Manager

## 1. Brand identity

**Product domain**: Schema-driven game asset CMS for internal studio library + public marketplace storefront.
**Users**: Studio admins managing game-development assets (3D models, audio, UI components, etc.).
**Feeling**: Clean, professional, modern corporate SaaS. Trustworthy, efficient, and unobtrusive. The UI should feel like a polished productivity tool, not a themed marketing site.

## 2. Color palette

| Token | Value | Usage |
|---|---|---|
| `--bg-base` | `#ffffff` | Root background (light mode) |
| `--bg-surface` | `#ffffff` | Cards, modals |
| `--bg-elevated` | `#f8fafc` | Inputs, elevated surfaces, table headers |
| `--bg-hover` | `#f1f5f9` | Hover states |
| `--bg-muted` | `#f8fafc` | Subtle backgrounds |
| `--border-default` | `#e2e8f0` | Card/input borders |
| `--border-subtle` | `#f1f5f9` | Subtle dividers |
| `--border-active` | `#cbd5e1` | Active/focus borders |
| `--text-primary` | `#0f172a` | Headings, body text |
| `--text-secondary` | `#475569` | Secondary text |
| `--text-muted` | `#64748b` | Muted/placeholder text |
| `--text-inverse` | `#ffffff` | Text on dark/accent backgrounds |
| `--accent` | `#4f46e5` | Primary actions, active states, brand |
| `--accent-hover` | `#4338ca` | Hover on accent buttons |
| `--accent-muted` | `#eef2ff` | Accent backgrounds |
| `--accent-border` | `#c7d2fe` | Accent borders |
| Status colors | `#22c55e` / `#f59e0b` / `#ef4444` / `#737373` / `#4f46e5` | Success, warning, error, neutral, published badges |

## 3. Typography

- **Font family**: System font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).
- **Scale**: Tailwind defaults. Headings use `text-2xl font-semibold tracking-tight`. Body text `text-sm`. Labels `text-xs font-medium text-[--text-muted]`.
- **No uppercase tracking-wider labels by default** — use sentence case for a friendlier, modern feel.
- **Monospace**: Used for slugs, codes, technical labels. System monospace stack.
- **Tabular figures**: Enable `font-variant-numeric: tabular-nums` for data tables.

## 4. Spacing and layout

- **Layout**: Fixed sidebar (w-64) + scrollable main content area. Sidebar collapses on mobile (<lg).
- **Content width**: `max-w-7xl` container with `px-4 py-6 sm:px-6 lg:px-8`.
- **Card padding**: `px-5 py-4`.
- **Grid gaps**: `gap-4` for card grids, `gap-3` for inline flex items.
- **Border radius**: `rounded-lg` for cards, `rounded-md` for inputs/buttons, `rounded-full` for badges.
- **Shadows**: Subtle `shadow-sm` and `shadow` only. No colored glows.

## 5. Component patterns

### Buttons
- **Primary**: Indigo background (`--accent`), white text, no border. Hover: `--accent-hover`.
- **Secondary**: White background, `--text-secondary` text, `--border-default` border. Hover: `--bg-hover`.
- **Ghost**: Transparent, `--text-secondary` text. Hover: `--bg-hover`.
- **Danger**: `#ef4444` background, white text.
- **Sizes**: `sm` (px-3 py-1.5 text-xs), `md` (px-4 py-2 text-sm), `lg` (px-5 py-2.5 text-sm).
- **Disabled**: `opacity-50 cursor-not-allowed`.

### Cards
- White surface (`--bg-surface`), subtle border (`--border-default`), `rounded-lg`, `shadow-sm`.
- Optional hover: `transition-colors hover:border-[--border-active]`.

### Inputs
- White background, `--border-default` border.
- Focus: `--accent` border + `ring-1 ring-[--accent]`.
- Labels: `text-sm font-medium text-[--text-secondary]`.

### Badges
- `rounded-full border px-2 py-0.5 text-[10px] font-medium`.
- Variants: default (muted), accent (indigo), success (green), warning (amber), error (red).

### Empty states
- `rounded-lg border border-dashed border-[--border-default] bg-[--bg-surface] px-6 py-16 text-center`.
- Icon + title + description + optional action button.

### Error banners
- `rounded-md border p-3 text-sm` with error border/background/color.
- Dismissible with ✕ button.

## 6. Motion and interaction

- **Transitions**: All interactive elements use `transition-colors duration-200`.
- **Hover**: Buttons shift background/border color smoothly. Cards get border highlight.
- **Focus**: `focus-visible:outline-2 outline-[--accent] offset-2` globally.
- **Sidebar**: Mobile toggle uses `translate-x` with `duration-200 ease-in-out`.
- **No heavy animations** — this is an admin tool.

## 7. Iconography

- **Icon set**: Lucide React (svg icons). Do NOT use emojis as icons.

### Frontend rules
- All UI tokens MUST reference these CSS custom properties. No raw hex codes.
- SVG icons only (Lucide). Emojis removed from all visible UI.
- GPU-composited animation only (transform, opacity).
- All interactive elements have hover + focus states.
