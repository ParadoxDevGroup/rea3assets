"use client";

// ---------------------------------------------------------------------------
// Select — Styled dropdown with label, options, and help text
// ---------------------------------------------------------------------------

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
