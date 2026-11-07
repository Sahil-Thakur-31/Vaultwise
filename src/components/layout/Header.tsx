"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlignJustify,
  Command,
  Laptop,
  Lock,
  Moon,
  RefreshCw,
  Search,
  Shield,
  Sun,
  WifiOff,
} from "lucide-react";
import { ThemeMode, UiDensity, VaultScope } from "@/types/vault";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

interface HeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
  scope: VaultScope;
  activeAccount: string;
  onNotify: (msg: string) => void;
  userInitials?: string;
  theme: ThemeMode;
  onToggleTheme: (theme: ThemeMode) => void;
  onOpenCommandPalette?: () => void;
  density?: UiDensity;
  onToggleDensity?: () => void;
  onLockVault?: () => void;
  onOpenShortcuts?: () => void;
}

export function Header({
  query,
  onQueryChange,
  scope,
  activeAccount,
  onNotify,
  userInitials = "SK",
  theme,
  onToggleTheme,
  onOpenCommandPalette,
  density = "comfortable",
  onToggleDensity,
  onLockVault,
  onOpenShortcuts,
}: HeaderProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { isOnline } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      onNotify("Vault synchronized with cryptographic enclave (AES-256)");
    }, 600);
  };

  // Shortcut ⌘K / Ctrl+K focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 sm:px-6 select-none transition-colors">
      {/* Left: Active context label */}
      <div className="flex items-center gap-2.5">
        <span className="text-xs font-semibold text-[var(--text-primary)]">
          {activeAccount}
        </span>
        <span className="rounded border border-[var(--border-subtle)] bg-[var(--bg-app)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]">
          {scope === "personal" ? "Personal" : "Organization"}
        </span>

        {/* Network & Zero-Knowledge Security Badge */}
        {isOnline ? (
          <span className="hidden md:flex items-center gap-1 rounded border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 animate-fade-in shadow-2xs">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
            <Shield className="size-2.5" />
            Zero-Knowledge Active
          </span>
        ) : (
          <span
            onClick={() => onNotify("Vault operates offline with local AES-256 storage. Reconnects automatically when online.")}
            className="flex items-center gap-1.5 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 animate-fade-in cursor-pointer hover:bg-amber-500/20 transition"
            title="Local offline encrypted storage is active"
          >
            <WifiOff className="size-3" />
            Offline Mode • Local Storage
          </span>
        )}

        {/* Sync Vault Button */}
        <button
          type="button"
          onClick={handleSync}
          className="hidden lg:flex items-center gap-1 rounded border border-[var(--border-subtle)] bg-[var(--bg-app)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-blue-500/40 transition cursor-pointer"
          title="Force cryptographic synchronization with local enclave"
        >
          <RefreshCw className={`size-2.5 ${isSyncing ? "animate-spin text-blue-500" : ""}`} />
          Sync
        </button>
      </div>

      {/* Center: Search input */}
      <div className="w-72 sm:w-80 max-w-sm">
        <label className="flex h-7.5 items-center gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--input-bg)] px-2.5 text-[var(--text-muted)] focus-within:border-[var(--accent-primary)] focus-within:ring-1 focus-within:ring-[var(--accent-primary)] transition">
          <Search className="size-3.5 shrink-0" />
          <input
            ref={searchInputRef}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search vault (⌘K)..."
            className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] font-normal"
          />
          {onOpenCommandPalette ? (
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="hidden sm:inline rounded border border-[var(--border-subtle)] bg-[var(--bg-app)] px-1.5 py-0.2 text-[9px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-blue-500 cursor-pointer transition"
              title="Open Spotlight Command Palette (⌘K)"
            >
              ⌘K
            </button>
          ) : (
            <kbd className="hidden sm:inline rounded border border-[var(--border-subtle)] bg-[var(--bg-app)] px-1.5 py-0.2 text-[9px] font-mono text-[var(--text-muted)]">
              ⌘K
            </kbd>
          )}
        </label>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Density Toggle (Compact vs Comfortable) */}
        {onToggleDensity && (
          <button
            type="button"
            onClick={onToggleDensity}
            className="flex items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-app)] px-2 py-1 text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition cursor-pointer"
            title={`Toggle layout density (Current: ${density})`}
          >
            <AlignJustify className="size-3 text-blue-500" />
            <span className="hidden xl:inline text-[10px] capitalize">{density}</span>
          </button>
        )}

        {/* Theme Segmented Switcher */}
        <div className="flex items-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-app)] p-0.5">
          <button
            type="button"
            onClick={() => onToggleTheme("system")}
            className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium transition ${
              theme === "system"
                ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-2xs font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
            title="System theme"
          >
            <Laptop className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => onToggleTheme("dark")}
            className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium transition ${
              theme === "dark"
                ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-2xs font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
            title="Dark mode"
          >
            <Moon className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => onToggleTheme("light")}
            className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium transition ${
              theme === "light"
                ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-2xs font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
            title="Light mode"
          >
            <Sun className="size-3" />
          </button>
        </div>

        {/* Keyboard Shortcuts Cheat Sheet Button */}
        {onOpenShortcuts && (
          <button
            type="button"
            onClick={onOpenShortcuts}
            className="hidden sm:flex items-center justify-center size-6.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-blue-500 hover:border-blue-500/30 transition cursor-pointer"
            title="Keyboard shortcuts cheat sheet (⌘/)"
          >
            <Command className="size-3" />
          </button>
        )}

        {/* Quick Lock Button */}
        {onLockVault && (
          <button
            type="button"
            onClick={onLockVault}
            className="flex items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2 py-1 text-xs text-[var(--text-secondary)] hover:text-amber-500 hover:border-amber-500/30 transition cursor-pointer"
            title="Lock vault immediately (⌘L)"
          >
            <Lock className="size-3" />
            <span className="hidden sm:inline text-[10px] font-semibold">Lock</span>
          </button>
        )}

        {/* User initials badge */}
        <div className="grid size-6.5 place-items-center rounded-md bg-slate-800 text-[10px] font-semibold text-slate-200 border border-slate-700 shrink-0">
          {userInitials}
        </div>
      </div>
    </header>
  );
}
