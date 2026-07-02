import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReA3 Assets",
  description: "Schema-driven game asset CMS + marketplace storefront",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased" style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}>
        {children}
      </body>
    </html>
  );
}
