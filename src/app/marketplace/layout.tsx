"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

// ---------------------------------------------------------------------------
// Marketplace layout — public storefront shell
// Header + main content + footer. No sidebar, no auth.
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
    <div className="flex min-h-screen flex-col bg-[var(--bg-base)]">
      {/* Header */}
      <header className="border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/marketplace"
            className="flex-shrink-0 text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] transition-colors hover:text-[var(--accent)]"
          >
            ReA3 Marketplace
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative mx-auto w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)] py-1.5 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </form>

          {/* Nav */}
          <nav className="flex items-center gap-4">
            <Link
              href="/marketplace"
              className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Browse
            </Link>
            <Link
              href="/"
              className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-xs text-[var(--text-muted)]">
            &copy; ReA3 Studio
          </p>
        </div>
      </footer>
    </div>
  );
}
