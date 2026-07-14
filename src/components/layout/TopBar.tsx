"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Top bar — dark theme, search + branding
// ---------------------------------------------------------------------------

interface TopBarProps {
  onSidebarToggle: () => void;
}

export function TopBar({ onSidebarToggle }: TopBarProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  // Global "/" key to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && searchValue.trim()) {
        router.push(`/assets?search=${encodeURIComponent(searchValue.trim())}`);
      }
    },
    [searchValue, router],
  );

  const pathname = usePathname();

  // Build breadcrumb from pathname — skip segments that look like IDs
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i, arr) => {
    // Skip segments that look like IDs (UUIDs, long alphanumeric, or containing many hyphens with mixed case)
    const looksLikeId = /^[a-f0-9-]{20,}$/i.test(seg) || /^[a-zA-Z0-9]{15,}$/.test(seg);
    if (looksLikeId && i > 0) return null;
    return {
      label: seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      href: "/" + arr.slice(0, i + 1).join("/"),
      isLast: i === arr.length - 1,
    };
  }).filter(Boolean) as Array<{ label: string; href: string; isLast: boolean }>;

  return (
    <header
      className="sticky top-0 z-20 flex h-14 items-center border-b px-4"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-default)",
      }}
    >
      {/* Left: hamburger toggle */}
      <button
        onClick={onSidebarToggle}
        className="mr-4 rounded-md p-1.5 transition-colors lg:hidden"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb (hidden on mobile, shown on lg+) */}
      <nav className="mr-4 hidden items-center gap-1.5 text-xs lg:flex" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-[var(--text-muted)]">/</span>}
            {crumb.isLast ? (
              <span className="font-medium text-[var(--text-primary)]">{crumb.label}</span>
            ) : (
              <a
                href={crumb.href}
                className="text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              >
                {crumb.label}
              </a>
            )}
          </span>
        ))}
      </nav>

      {/* Center: search */}
      <div className="flex flex-1 items-center">
        <div className="relative w-full max-w-xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={16} style={{ color: "var(--text-muted)" }} />
          </div>
          <input
            ref={searchRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search assets, types, tags... (press / to focus)"
            className="block w-full rounded-lg border py-2 pl-10 text-sm transition-all duration-150 focus:outline-none focus:ring-1"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "var(--border-default)",
              color: "var(--text-primary)",
              paddingRight: searchValue ? "2.5rem" : "1rem",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.boxShadow = "0 0 0 1px var(--accent)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border-default)";
              e.currentTarget.style.boxShadow = "none";
            }}
            aria-label="Global search"
          />
          {/* Clear button */}
          {searchValue && (
            <button
              onClick={() => {
                setSearchValue("");
                searchRef.current?.focus();
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
          {/* Keyboard shortcut hint */}
          {!searchValue && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <kbd
                className="hidden rounded border px-1.5 py-0.5 text-xs font-medium sm:inline-block"
                style={{ borderColor: "var(--border-default)", color: "var(--text-muted)" }}
              >
                /
              </kbd>
            </div>
          )}
        </div>
      </div>

      {/* Right: environment badge */}
      <div className="ml-4 flex items-center gap-3">
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider"
          style={{
            backgroundColor: "var(--accent-muted)",
            color: "var(--accent)",
            border: "1px solid var(--accent)",
          }}
        >
          {process.env.NODE_ENV === "production" ? "PROD" : "DEV"}
        </span>
      </div>
    </header>
  );
}
