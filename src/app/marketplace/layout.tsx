"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Hexagon } from "lucide-react";

// ---------------------------------------------------------------------------
// Marketplace layout — public storefront shell
// Cyberpunk dark aesthetic matching the login page and rea3.studio brand.
// Ambient glow, grid pattern, accent lines, Hexagon branding, polished footer.
// ---------------------------------------------------------------------------

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    if (trimmed) {
      router.push(`/marketplace?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/marketplace");
    }
  };

  return (
    <div
      className="relative flex min-h-screen flex-col"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(255,77,77,0.05) 0%, transparent 60%)",
        }}
      />

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Top accent line */}
      <div
        className="absolute left-0 right-0 top-0 h-px opacity-20"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, var(--accent) 40%, var(--accent) 60%, transparent 100%)",
        }}
      />

      {/* Header */}
      <header
        className="relative border-b backdrop-blur-sm"
        style={{
          backgroundColor: "rgba(20,20,20,0.85)",
          borderColor: "var(--border-default)",
        }}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link
            href="/marketplace"
            className="flex flex-shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg border"
              style={{
                backgroundColor: "var(--accent-muted)",
                borderColor: "rgba(255,77,77,0.15)",
              }}
            >
              <Hexagon className="h-4 w-4" style={{ color: "var(--accent)" }} />
            </div>
            <span
              className="text-sm font-bold uppercase tracking-wider"
              style={{
                color: "var(--text-primary)",
                textShadow: "0 0 30px rgba(255,77,77,0.1)",
              }}
            >
              ReA3
            </span>
          </Link>

          {/* Divider */}
          <div className="h-5 w-px" style={{ backgroundColor: "var(--border-default)" }} />

          {/* Search */}
          <form onSubmit={handleSearch} className="relative mx-auto w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full rounded-lg border py-1.5 pl-9 pr-3 text-sm transition-all duration-200 placeholder:text-[var(--text-muted)]"
              style={{
                backgroundColor: "var(--bg-elevated)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--accent)";
                e.target.style.boxShadow = "0 0 0 2px rgba(255,77,77,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border-default)";
                e.target.style.boxShadow = "none";
              }}
            />
          </form>

          {/* Nav */}
          <nav className="flex flex-shrink-0 items-center gap-1">
            <Link
              href="/marketplace"
              className="rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
              style={{
                backgroundColor: "var(--accent-muted)",
                color: "var(--accent)",
              }}
            >
              Browse
            </Link>
            <Link
              href="/"
              className="rounded-md px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary)";
                e.currentTarget.style.backgroundColor = "var(--bg-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer
        className="relative border-t"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "rgba(20,20,20,0.5)",
        }}
      >
        {/* Footer accent glow */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-px opacity-15"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, var(--accent) 50%, transparent 100%)",
          }}
        />
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Hexagon className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              &copy; ReA3 Studio
            </span>
          </div>
          <span className="text-[10px]" style={{ color: "var(--text-muted)", opacity: 0.5 }}>
            Asset Manager v0.6
          </span>
        </div>
      </footer>
    </div>
  );
}
