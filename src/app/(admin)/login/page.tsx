"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, ErrorBanner } from "@/components/ui";

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
        className="w-full max-w-sm rounded-lg border p-8 shadow-2xl"
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
          <Input
            label="Password"
            placeholder="Enter admin password"
            value={password}
            onChange={setPassword}
            type="password"
            id="password"
            required
            autoFocus
          />

          {error && (
            <ErrorBanner message={error} onDismiss={() => setError(null)} />
          )}

          <Button
            type="submit"
            disabled={!password.trim() || loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
            Set ADMIN_PASSWORD in .env to enable authentication.
          </p>
        </form>
      </div>
    </div>
  );
}
