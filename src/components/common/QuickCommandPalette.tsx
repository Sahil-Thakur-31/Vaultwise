"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  KeyRound,
  Lock,
  Plus,
  Search,
  Send,
  ShieldCheck,
} from "lucide-react";
import { VaultItem, ViewType } from "@/types/vault";
import { ItemLogo } from "../vault/ItemLogo";
import { copySensitiveText, copyTextSafely } from "@/lib/clipboard";

interface QuickCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  items: VaultItem[];
  onSelectItem: (id: number) => void;
  onSelectView: (view: ViewType) => void;
  onAddNewItem: () => void;
  onLockVault: () => void;
  onNotify: (msg: string) => void;
}

export function QuickCommandPalette({
  isOpen,
  onClose,
  items,
  onSelectItem,
  onSelectView,
  onAddNewItem,
  onLockVault,
  onNotify,
}: QuickCommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  // Filter items
  const matchingItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 8);
    return items
      .filter(
        (i) =>
          !i.isTrashed &&
          (i.name.toLowerCase().includes(q) ||
            i.username.toLowerCase().includes(q) ||
            (i.url && i.url.toLowerCase().includes(q)))
      )
      .slice(0, 10);
  }, [items, query]);

  const handleCopyPassword = async (item: VaultItem) => {
    if (!item.password) return;
    const ok = await copySensitiveText(item.password, `Password for ${item.name}`, undefined, onNotify);
    if (ok) {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  const handleCopyUsername = async (item: VaultItem) => {
    const ok = await copyTextSafely(item.username);
    if (ok) {
      onNotify(`Username copied for ${item.name}`);
    } else {
      onNotify("Failed to copy username");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-start pt-20 justify-center bg-slate-950/60 p-4 backdrop-blur-xs select-none"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3 bg-[var(--bg-card)]">
          <Search className="size-4 text-[var(--text-muted)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items, commands, or press Esc to close..."
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
          />
          <kbd
            onClick={handleClose}
            className="rounded border border-[var(--border-subtle)] bg-[var(--bg-app)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-primary)]"
          >
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Action Commands */}
          {!query && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Quick Actions
              </div>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onAddNewItem();
                  }}
                  className="flex h-8 w-full items-center justify-between rounded-lg px-2.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)] hover:text-[var(--text-primary)] transition"
                >
                  <span className="flex items-center gap-2.5">
                    <Plus className="size-3.5 text-blue-500" />
                    Create New Vault Item
                  </span>
                  <kbd className="text-[10px] font-mono text-[var(--text-muted)]">⌘N</kbd>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onSelectView("generator");
                  }}
                  className="flex h-8 w-full items-center justify-between rounded-lg px-2.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)] hover:text-[var(--text-primary)] transition"
                >
                  <span className="flex items-center gap-2.5">
                    <KeyRound className="size-3.5 text-blue-500" />
                    Open Password & Passphrase Generator
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onSelectView("send");
                  }}
                  className="flex h-8 w-full items-center justify-between rounded-lg px-2.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)] hover:text-[var(--text-primary)] transition"
                >
                  <span className="flex items-center gap-2.5">
                    <Send className="size-3.5 text-blue-500" />
                    Open Vaultwise Send (Encrypted Sharing)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onSelectView("reports");
                  }}
                  className="flex h-8 w-full items-center justify-between rounded-lg px-2.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--accent-subtle)] hover:text-[var(--text-primary)] transition"
                >
                  <span className="flex items-center gap-2.5">
                    <ShieldCheck className="size-3.5 text-emerald-500" />
                    Run Vault Security Health Audit
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onLockVault();
                  }}
                  className="flex h-8 w-full items-center justify-between rounded-lg px-2.5 text-xs text-rose-500 hover:bg-rose-500/10 transition"
                >
                  <span className="flex items-center gap-2.5">
                    <Lock className="size-3.5" />
                    Lock Vault Now
                  </span>
                  <kbd className="text-[10px] font-mono text-rose-400">⌘L</kbd>
                </button>
              </div>
            </div>
          )}

          {/* Vault Items List */}
          <div>
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Vault Items {query ? `(${matchingItems.length})` : "Recent"}
            </div>
            <div className="space-y-0.5">
              {matchingItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    handleClose();
                    onSelectView("vault");
                    onSelectItem(item.id);
                  }}
                  className="group flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-xs hover:bg-[var(--accent-subtle)] transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ItemLogo item={item} size="sm" />
                    <div className="min-w-0">
                      <b className="block truncate font-semibold text-[var(--text-primary)]">
                        {item.name}
                      </b>
                      <small className="block truncate font-mono text-[11px] text-[var(--text-muted)]">
                        {item.username}
                      </small>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyUsername(item);
                      }}
                      className="rounded border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
                      title="Copy Username"
                    >
                      <Copy className="size-2.5" />
                      User
                    </button>
                    {item.password && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyPassword(item);
                        }}
                        className="rounded border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
                        title="Copy Password"
                      >
                        <Copy className="size-2.5" />
                        {copiedId === item.id ? "Copied!" : "Pass"}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {matchingItems.length === 0 && (
                <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                  No matching credentials found for &quot;{query}&quot;
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Shortcut Bar */}
        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--bg-app)] px-4 py-2 text-[10px] text-[var(--text-muted)]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono">↑↓</kbd> navigate
            </span>
            <span>
              <kbd className="font-mono">↵</kbd> open
            </span>
            <span>
              <kbd className="font-mono">esc</kbd> close
            </span>
          </div>
          <span className="font-mono">Vaultwise Spotlight</span>
        </div>
      </div>
    </div>
  );
}
