"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Hexagon } from "lucide-react";

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
    <div className="relative flex min-h-screen flex-col bg-[var(--bg-base)]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link
            href="/marketplace"
            className="flex flex-shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-muted)] text-[var(--accent)]">
              <Hexagon size={18} />
            </span>
            <span className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
              ReA3
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative mx-auto w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] py-1.5 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)]"
            />
          </form>

          {/* Nav */}
          <nav className="flex flex-shrink-0 items-center gap-1">
            <Link
              href="/marketplace"
              className="rounded-md bg-[var(--accent-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--accent)]"
            >
              Browse
            </Link>
            <Link
              href="/"
              className="rounded-md px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
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
      <footer className="border-t border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Hexagon className="h-4 w-4 text-[var(--text-muted)]" />
            <span className="text-xs text-[var(--text-muted)]">
              &copy; ReA3 Studio
            </span>
          </div>
          <span className="text-xs text-[var(--text-faint)]">
            Asset Manager v0.6
          </span>
        </div>
      </footer>
    </div>
  );
}
