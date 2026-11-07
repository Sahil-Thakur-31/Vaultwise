"use client";

import { useEffect, useRef } from "react";
import {
  Command,
  Laptop,
  Lock,
  Moon,
  Search,
  Shield,
  Sun,
  WifiOff,
} from "lucide-react";
import { ThemeMode, UiDensity, UserProfile, VaultScope } from "@/types/vault";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { ProfileDropdown } from "./ProfileDropdown";

interface HeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
  scope: VaultScope;
  userProfile: UserProfile;
  onNotify: (msg: string) => void;
  theme: ThemeMode;
  onToggleTheme: (theme: ThemeMode) => void;
  onOpenCommandPalette?: () => void;
  density: UiDensity;
  onToggleDensity: (newDensity: UiDensity) => void;
  onLockVault?: () => void;
  onOpenShortcuts?: () => void;
  onOpenEditProfile: () => void;
  onNavigateToSettings: () => void;
}

export function Header({
  query,
  onQueryChange,
  scope,
  userProfile,
  onNotify,
  theme,
  onToggleTheme,
  onOpenCommandPalette,
  density,
  onToggleDensity,
  onLockVault,
  onOpenShortcuts,
  onOpenEditProfile,
  onNavigateToSettings,
}: HeaderProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { isOnline } = useNetworkStatus();

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
      {/* Left: Minimal, quiet security badge */}
      <div className="flex items-center gap-2">
        {isOnline ? (
          <span
            className="flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400 shadow-2xs"
            title="Zero-knowledge client-side encryption active (AES-GCM-256) with automatic background sync"
          >
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <Shield className="size-3" />
            <span className="hidden sm:inline">Zero-Knowledge Enclave</span>
          </span>
        ) : (
          <span
            onClick={() =>
              onNotify(
                "Vault operates offline with local AES-256 storage. Reconnects automatically when online."
              )
            }
            className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-medium text-amber-400 cursor-pointer hover:bg-amber-500/20 transition"
            title="Local offline encrypted storage is active"
          >
            <WifiOff className="size-3" />
            <span>Offline Mode</span>
          </span>
        )}
      </div>

      {/* Center: Search input */}
      <div className="w-72 sm:w-96 max-w-md mx-2">
        <label className="flex h-8 items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--input-bg)] px-3 text-[var(--text-muted)] focus-within:border-[var(--accent-primary)] focus-within:ring-1 focus-within:ring-[var(--accent-primary)] transition">
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
              className="hidden sm:inline rounded border border-[var(--border-subtle)] bg-[var(--bg-app)] px-1.5 py-0.5 text-[9px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-blue-500 cursor-pointer transition"
              title="Open Spotlight Command Palette (⌘K)"
            >
              ⌘K
            </button>
          ) : (
            <kbd className="hidden sm:inline rounded border border-[var(--border-subtle)] bg-[var(--bg-app)] px-1.5 py-0.5 text-[9px] font-mono text-[var(--text-muted)]">
              ⌘K
            </kbd>
          )}
        </label>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Theme Segmented Switcher */}
        <div className="flex items-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] p-0.5">
          <button
            type="button"
            onClick={() => onToggleTheme("system")}
            className={`flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium transition cursor-pointer ${
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
            className={`flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium transition cursor-pointer ${
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
            className={`flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium transition cursor-pointer ${
              theme === "light"
                ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-2xs font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
            title="Light mode"
          >
            <Sun className="size-3" />
          </button>
        </div>

        {/* Keyboard Shortcuts Button */}
        {onOpenShortcuts && (
          <button
            type="button"
            onClick={onOpenShortcuts}
            className="hidden sm:flex items-center justify-center size-7 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-blue-500 hover:border-blue-500/30 transition cursor-pointer"
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
            className="flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:text-rose-400 hover:border-rose-500/30 transition cursor-pointer"
            title="Lock vault immediately (⌘L)"
          >
            <Lock className="size-3 text-rose-500" />
            <span className="hidden sm:inline text-[10px] font-semibold">Lock</span>
          </button>
        )}

        {/* Interactive Profile Dropdown */}
        <ProfileDropdown
          profile={userProfile}
          scope={scope}
          density={density}
          onToggleDensity={onToggleDensity}
          onOpenEditProfile={onOpenEditProfile}
          onNavigateToSettings={onNavigateToSettings}
          onOpenShortcuts={onOpenShortcuts}
          onLockVault={onLockVault}
        />
      </div>
    </header>
  );
}
