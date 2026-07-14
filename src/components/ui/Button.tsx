"use client";

// ---------------------------------------------------------------------------
// Button — Action trigger primitive
// ---------------------------------------------------------------------------

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
