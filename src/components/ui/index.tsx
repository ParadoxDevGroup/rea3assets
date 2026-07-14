"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";

// Re-export shared icon helpers
export {
  DynamicIcon,
  FIELD_TYPE_ICONS,
  PROCESSOR_ICONS,
  DIVISION_ICONS,
} from "./DynamicIcon";

// ---------------------------------------------------------------------------
// Shared UI primitives — ReA3 Asset Manager dark theme
// Enterprise-grade components with micro-interactions and accessibility
// ---------------------------------------------------------------------------

// --- Badge ---

export type BadgeVariant = "default" | "accent" | "success" | "warning" | "error" | "muted";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

export function Badge({ children, variant = "default", size = "sm" }: BadgeProps) {
  const variants: Record<string, string> = {
    default: "border-[var(--border-default)] text-[var(--text-secondary)]",
    accent: "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-muted)]",
    success: "border-[var(--status-approved)] text-[var(--status-approved)] bg-[rgba(34,197,94,0.15)]",
    warning: "border-[var(--status-review)] text-[var(--status-review)] bg-[rgba(245,158,11,0.15)]",
    error: "border-[var(--status-deprecated)] text-[var(--status-deprecated)] bg-[rgba(239,68,68,0.15)]",
    muted: "border-[var(--border-subtle)] text-[var(--text-muted)]",
  };

  const sizes: Record<string, string> = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium uppercase tracking-wider ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
}

// --- Status Badge ---

const STATUS_CONFIG: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
  draft: { label: "Draft", variant: "muted" },
  in_review: { label: "In Review", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  published: { label: "Published", variant: "accent" },
  deprecated: { label: "Deprecated", variant: "error" },
  archived: { label: "Archived", variant: "muted" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: "default" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// --- Card ---

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  href?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", hover = false, href, onClick }: CardProps) {
  const base = `rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] ${hover ? "transition-all duration-200 hover:border-[var(--border-active)] hover:bg-[var(--bg-elevated)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]" : ""} ${className}`;

  if (href) {
    return (
      <Link href={href} className={`block ${base}`}>
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={`block w-full text-left ${base} transition-all duration-200 active:scale-[0.99]`}>
        {children}
      </button>
    );
  }

  return <div className={base}>{children}</div>;
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`border-b border-[var(--border-default)] px-5 py-4 ${className}`}>{children}</div>;
}

export function CardBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}

// --- Button ---

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
  title?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  onClick,
  className = "",
  title,
}: ButtonProps) {
  const variants: Record<string, string> = {
    primary:
      "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] border-transparent active:scale-[0.97]",
    secondary:
      "bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border-[var(--border-default)] active:scale-[0.97]",
    ghost:
      "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border-transparent active:scale-[0.97]",
    danger:
      "bg-[var(--status-deprecated)] text-white hover:opacity-90 border-transparent active:scale-[0.97]",
  };

  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={`inline-flex items-center justify-center gap-2 rounded-md border font-medium uppercase tracking-wider transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

// --- Input ---

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
  className?: string;
  helpText?: string;
  required?: boolean;
  error?: string;
  id?: string;
  autoFocus?: boolean;
}

export function Input({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  className = "",
  helpText,
  required,
  error,
  id,
  autoFocus,
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
          {label}
          {required && <span className="ml-1 text-[var(--accent)]">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        autoFocus={autoFocus}
        className={`block w-full rounded-md border bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all duration-150 focus:outline-none focus:ring-1 ${
          error
            ? "border-[var(--status-deprecated)] focus:border-[var(--status-deprecated)] focus:ring-[var(--status-deprecated)]"
            : "border-[var(--border-default)] focus:border-[var(--accent)] focus:ring-[var(--accent)]"
        }`}
      />
      {error && <p className="mt-1 text-xs text-[var(--status-deprecated)]">{error}</p>}
      {helpText && !error && <p className="mt-1 text-xs text-[var(--text-muted)]">{helpText}</p>}
    </div>
  );
}

// --- Textarea ---

interface TextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
  className?: string;
  helpText?: string;
  required?: boolean;
  error?: string;
  monospace?: boolean;
}

export function Textarea({
  label,
  placeholder,
  value,
  onChange,
  rows = 3,
  className = "",
  helpText,
  required,
  error,
  monospace,
}: TextareaProps) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
          {label}
          {required && <span className="ml-1 text-[var(--accent)]">*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        rows={rows}
        className={`block w-full rounded-md border bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all duration-150 focus:outline-none focus:ring-1 resize-y ${
          monospace ? "font-mono text-xs" : ""
        } ${
          error
            ? "border-[var(--status-deprecated)] focus:border-[var(--status-deprecated)] focus:ring-[var(--status-deprecated)]"
            : "border-[var(--border-default)] focus:border-[var(--accent)] focus:ring-[var(--accent)]"
        }`}
      />
      {error && <p className="mt-1 text-xs text-[var(--status-deprecated)]">{error}</p>}
      {helpText && !error && <p className="mt-1 text-xs text-[var(--text-muted)]">{helpText}</p>}
    </div>
  );
}

// --- Select ---

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
  className = "",
  helpText,
  required,
  disabled,
}: SelectProps) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
          {label}
          {required && <span className="ml-1 text-[var(--accent)]">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="block w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] transition-all duration-150 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {helpText && <p className="mt-1 text-xs text-[var(--text-muted)]">{helpText}</p>}
    </div>
  );
}

// --- Toggle ---

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between">
      {label && (
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
          {description && <p className="text-xs text-[var(--text-muted)]">{description}</p>}
        </div>
      )}
      <button
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-surface)] ${
          checked ? "bg-[var(--accent)]" : "bg-[var(--bg-hover)]"
        }`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

// --- Skeleton ---

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[var(--bg-hover)] ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3.5 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-start gap-3">
        <Skeleton className="h-5 w-5 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonRow({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3 ${className}`}
      aria-hidden="true"
    >
      <Skeleton className="h-5 w-5 rounded" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

// --- Spinner ---

export function Spinner({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      className={`animate-spin text-current ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// --- ErrorBanner ---

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onDismiss, onRetry }: ErrorBannerProps) {
  return (
    <div
      className="flex items-start gap-3 rounded-md border border-[var(--status-deprecated)] bg-[rgba(239,68,68,0.1)] p-3 text-sm"
      style={{ color: "var(--status-deprecated)" }}
      role="alert"
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 text-xs font-medium uppercase tracking-wider underline hover:no-underline"
        >
          Retry
        </button>
      )}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 opacity-70 transition-opacity hover:opacity-100"
          aria-label="Dismiss error"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// --- Toast / Notification System ---

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

const toastListeners: Set<(toasts: Toast[]) => void> = new Set();
let toastList: Toast[] = [];

export function showToast(type: ToastType, message: string) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  toastList = [...toastList, { id, type, message }];
  toastListeners.forEach((fn) => fn(toastList));
  setTimeout(() => {
    toastList = toastList.filter((t) => t.id !== id);
    toastListeners.forEach((fn) => fn(toastList));
  }, 4000);
}

export function dismissToast(id: string) {
  toastList = toastList.filter((t) => t.id !== id);
  toastListeners.forEach((fn) => fn(toastList));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => setToasts(newToasts);
    toastListeners.add(listener);
    return () => {
      toastListeners.delete(listener);
    };
  }, []);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 size={18} className="text-[var(--status-approved)]" />,
    error: <AlertCircle size={18} className="text-[var(--status-deprecated)]" />,
    warning: <AlertTriangle size={18} className="text-[var(--status-review)]" />,
    info: <Info size={18} className="text-[var(--accent)]" />,
  };

  const borders: Record<ToastType, string> = {
    success: "border-[var(--status-approved)]",
    error: "border-[var(--status-deprecated)]",
    warning: "border-[var(--status-review)]",
    info: "border-[var(--accent)]",
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 rounded-md border ${borders[toast.type]} bg-[var(--bg-surface)] px-4 py-3 shadow-lg animate-[slideIn_0.2s_ease-out]`}
          style={{ minWidth: "280px", maxWidth: "400px" }}
        >
          {icons[toast.type]}
          <span className="flex-1 text-sm text-[var(--text-primary)]">{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="shrink-0 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// --- Modal ---

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, description, children, footer, maxWidth = "max-w-lg" }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    // Focus the modal container
    setTimeout(() => modalRef.current?.focus(), 0);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative z-10 w-full ${maxWidth} rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-2xl outline-none`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="border-b border-[var(--border-default)] px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 id="modal-title" className="text-lg font-bold uppercase tracking-wider text-[var(--text-primary)]">
                {title}
              </h2>
              {description && (
                <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-[var(--border-default)] px-6 py-4">
            <div className="flex items-center justify-end gap-3">
              {footer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- EmptyState ---

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-16 text-center">
      {icon && (
        <span className="mb-4 text-[var(--accent)] opacity-80" aria-hidden="true">
          {icon}
        </span>
      )}
      <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-[var(--text-muted)]">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// --- PageHeader ---

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wider text-[var(--text-primary)]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// --- StatCard ---

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  href?: string;
}

export function StatCard({ label, value, icon, description, href }: StatCardProps) {
  const content = (
    <CardBody>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-[var(--accent)] transition-transform duration-200 group-hover:scale-110" aria-hidden="true">
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            {label}
          </h3>
          <p className="mt-1 text-2xl font-bold text-[var(--text-primary)] tabular-nums">
            {value}
          </p>
          {description && (
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">{description}</p>
          )}
        </div>
      </div>
    </CardBody>
  );

  if (href) {
    return (
      <Link href={href} className="group block rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] transition-all duration-200 hover:border-[var(--border-active)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
        {content}
      </Link>
    );
  }

  return (
    <div className="group rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] transition-all duration-200 hover:border-[var(--border-active)]">
      {content}
    </div>
  );
}
