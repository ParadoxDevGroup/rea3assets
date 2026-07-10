"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// Login page — simple password gate
// ---------------------------------------------------------------------------

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Login failed");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--bg-base)" }}>
      <div
        className="w-full max-w-sm rounded-lg border p-8"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
      >
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
            REA3
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Asset Manager
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
              className="block w-full rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-1"
              style={{
                backgroundColor: "var(--bg-elevated)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.boxShadow = "0 0 0 1px var(--accent)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border-default)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {error && (
            <div
              className="rounded-md border p-2.5 text-center text-xs"
              style={{ borderColor: "var(--accent)", backgroundColor: "var(--accent-muted)", color: "var(--accent)" }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!password.trim() || loading}
            className="w-full rounded-md px-4 py-2 text-sm font-medium uppercase tracking-wider transition-colors disabled:opacity-50"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--accent)")}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
            Set ADMIN_PASSWORD in .env to enable authentication.
          </p>
        </form>
      </div>
    </div>
  );
}
