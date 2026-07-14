"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import {
  LayoutDashboard,
  Puzzle,
  Package,
  Tag,
  Settings2,
  Settings,
  LogOut,
  ChevronRight,
  Hexagon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: <LayoutDashboard size={18} /> },
  { label: "Asset Types", href: "/asset-types", icon: <Puzzle size={18} /> },
  { label: "Assets", href: "/assets", icon: <Package size={18} /> },
  { label: "Tags", href: "/tags", icon: <Tag size={18} /> },
  { label: "Pipelines", href: "/pipelines", icon: <Settings2 size={18} /> },
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings size={18} />,
    children: [
      { label: "General", href: "/settings", icon: <Settings size={18} /> },
      { label: "ERP Integration", href: "/settings/erp", icon: <Settings size={18} /> },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = useCallback(
    (item: NavItem): boolean => {
      if (item.href === "/") {
        return pathname === "/";
      }
      return pathname.startsWith(item.href);
    },
    [pathname],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onToggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onToggle]);

  const sidebarContent = (
    <>
      {/* Logo / Brand */}
      <div className="flex h-14 items-center border-b border-[var(--border-default)] px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-muted)] text-[var(--accent)]">
            <Hexagon size={18} />
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
              ReA3
            </span>
            <span className="text-[10px] font-medium text-[var(--text-muted)]">
              Assets
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              isActive={isActive(item)}
              pathname={pathname}
            />
          ))}
        </ul>
      </nav>

      {/* Footer — version indicator + logout */}
      <div className="border-t border-[var(--border-default)] px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--text-muted)]">
            <span className="font-medium text-[var(--text-secondary)]">v0.6.0</span>
            {" · "}Schema-driven CMS
          </p>
          <button
            onClick={async () => {
              setLoggingOut(true);
              try {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/login");
                router.refresh();
              } catch {
                setLoggingOut(false);
              }
            }}
            disabled={loggingOut}
            className="flex items-center gap-1 text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--accent)] disabled:opacity-50"
          >
            {loggingOut ? "..." : <><LogOut size={12} />Logout</>}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Desktop Sidebar — always visible */}
      <aside
        className="hidden w-64 flex-shrink-0 flex-col border-r border-[var(--border-default)] bg-[var(--bg-surface)] lg:flex"
        aria-label="Main navigation"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar — slides in/out */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[var(--border-default)] bg-[var(--bg-surface)] transition-transform duration-200 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Main navigation"
        aria-hidden={!isOpen}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

interface SidebarItemProps {
  item: NavItem;
  isActive: boolean;
  pathname: string;
}

function SidebarItem({ item, isActive, pathname }: SidebarItemProps) {
  const [isExpanded, setIsExpanded] = useState(isActive);
  const hasChildren = item.children && item.children.length > 0;

  useEffect(() => {
    if (item.children?.some((child) => pathname.startsWith(child.href))) {
      setIsExpanded(true);
    }
  }, [item.children, pathname]);

  if (!hasChildren) {
    return (
      <li>
        <Link
          href={item.href}
          className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            isActive
              ? "bg-[var(--accent-muted)] text-[var(--accent)]"
              : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          }`}
        >
          <span className="text-base" aria-hidden="true">{item.icon}</span>
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? "bg-[var(--accent-muted)] text-[var(--accent)]"
            : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
        }`}
        aria-expanded={isExpanded}
      >
        <span className="flex items-center gap-3">
          <span className="text-base" aria-hidden="true">{item.icon}</span>
          {item.label}
        </span>
        <span
          className={`text-[var(--text-muted)] transition-transform duration-200 ${
            isExpanded ? "rotate-90" : ""
          }`}
          aria-hidden="true"
        >
          <ChevronRight size={14} />
        </span>
      </button>

      {isExpanded && item.children && item.children.length > 0 && (
        <ul className="mt-1 ml-3 space-y-0.5 border-l border-[var(--border-default)] pl-3">
          {item.children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  pathname === child.href || pathname.startsWith(child.href)
                    ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                }`}
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
