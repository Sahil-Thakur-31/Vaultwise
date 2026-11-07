"use client";

import { ReactNode } from "react";

interface FieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
}

export function Field({ label, children, hint }: FieldProps) {
  return (
    <label className="block text-xs font-semibold text-[var(--text-secondary)]">
      <span className="flex items-center justify-between mb-1.5">
        <span>{label}</span>
        {hint && <span className="font-normal text-[var(--text-muted)] text-[11px]">{hint}</span>}
      </span>
      <span className="block [&_input]:w-full [&_input]:rounded-md [&_input]:border [&_input]:border-[var(--border-subtle)] [&_input]:bg-[var(--input-bg)] [&_input]:p-2.5 [&_input]:text-xs [&_input]:text-[var(--text-primary)] [&_input]:outline-none [&_input]:transition [&_input]:focus:border-[var(--accent-primary)] [&_input]:focus:ring-1 [&_input]:focus:ring-[var(--accent-primary)] [&_select]:w-full [&_select]:rounded-md [&_select]:border [&_select]:border-[var(--border-subtle)] [&_select]:bg-[var(--input-bg)] [&_select]:p-2.5 [&_select]:text-xs [&_select]:text-[var(--text-primary)] [&_select]:outline-none [&_select]:transition [&_select]:focus:border-[var(--accent-primary)] [&_select]:focus:ring-1 [&_select]:focus:ring-[var(--accent-primary)] [&_textarea]:w-full [&_textarea]:rounded-md [&_textarea]:border [&_textarea]:border-[var(--border-subtle)] [&_textarea]:bg-[var(--input-bg)] [&_textarea]:p-2.5 [&_textarea]:text-xs [&_textarea]:text-[var(--text-primary)] [&_textarea]:outline-none [&_textarea]:transition [&_textarea]:focus:border-[var(--accent-primary)] [&_textarea]:focus:ring-1 [&_textarea]:focus:ring-[var(--accent-primary)]">
        {children}
      </span>
    </label>
  );
}

interface ActionsProps {
  close: () => void;
  label: string;
  disabled?: boolean;
}

export function Actions({ close, label, disabled = false }: ActionsProps) {
  return (
    <div className="mt-6 flex justify-end gap-2.5 pt-3 border-t border-[var(--border-subtle)]">
      <button
        type="button"
        onClick={close}
        className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={disabled}
        className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 transition"
      >
        {label}
      </button>
    </div>
  );
}
