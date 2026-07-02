import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "ReA3 Assets — Admin",
};

/**
 * Admin layout (route group).
 *
 * All (admin) routes are wrapped in the global shell: sidebar + top bar
 * + main content area. Dark theme matching rea3.studio.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
