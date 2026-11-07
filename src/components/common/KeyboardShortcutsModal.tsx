"use client";

import { Command, Shield, X } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: "Navigation" | "Vault Operations" | "Security";
}

const SHORTCUTS: ShortcutItem[] = [
  {
    keys: ["⌘", "K"],
    description: "Open Spotlight Quick Command Palette",
    category: "Navigation",
  },
  {
    keys: ["⌘", "N"],
    description: "Create a new Vault Credential or Secure Note",
    category: "Vault Operations",
  },
  {
    keys: ["⌘", "L"],
    description: "Lock Vault Enclave immediately",
    category: "Security",
  },
  {
    keys: ["⌘", "/"],
    description: "Display Keyboard Shortcuts reference cheat sheet",
    category: "Navigation",
  },
  {
    keys: ["Esc"],
    description: "Close current dialog, modal, or context menu",
    category: "Navigation",
  },
  {
    keys: ["↑", "↓"],
    description: "Navigate previous or next item in Vault List",
    category: "Vault Operations",
  },
  {
    keys: ["Tab"],
    description: "Cycle between focusable input fields and controls",
    category: "Navigation",
  },
  {
    keys: ["Enter"],
    description: "Execute default primary action or submit form",
    category: "Navigation",
  },
];

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-surface)]">
          <div className="flex items-center gap-2">
            <Command className="size-4 text-blue-500" />
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Keyboard Accelerators</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] transition"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="divide-y divide-[var(--border-subtle)]">
            {SHORTCUTS.map((s, idx) => (
              <div
                key={idx}
                className="py-2.5 flex items-center justify-between gap-4 text-xs"
              >
                <span className="text-[var(--text-secondary)] font-medium">
                  {s.description}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  {s.keys.map((k, kIdx) => (
                    <kbd
                      key={kIdx}
                      className="min-w-6 inline-flex items-center justify-center rounded border border-[var(--border-subtle)] bg-[var(--bg-app)] px-2 py-0.5 font-mono text-[11px] font-semibold text-[var(--text-primary)] shadow-2xs"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 p-3 text-[11px] text-[var(--text-muted)] flex items-center gap-2">
            <Shield className="size-3.5 text-blue-500 shrink-0" />
            <span>
              Pro tip: Press <kbd className="font-mono font-bold text-[var(--text-primary)]">⌘L</kbd> whenever stepping away from your workspace to lock credentials in memory.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border-subtle)] px-6 py-3 bg-[var(--bg-surface)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition cursor-pointer"
          >
            Got it (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
