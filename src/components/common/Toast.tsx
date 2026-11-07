"use client";

import { CheckCircle2 } from "lucide-react";

interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  return (
    <div
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 rounded-2xl bg-[var(--bg-surface)]/95 backdrop-blur-xl px-4 py-3 text-xs font-semibold text-[var(--text-primary)] shadow-2xl transition-all duration-300 border border-[var(--border-subtle)] flex items-center gap-2.5 ${
        message
          ? "translate-y-0 opacity-100 scale-100 ring-2 ring-[var(--accent-glow)]"
          : "pointer-events-none translate-y-4 opacity-0 scale-95"
      }`}
    >
      <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
