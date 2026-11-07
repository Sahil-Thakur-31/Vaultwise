"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlignJustify,
  Check,
  ChevronDown,
  Command,
  Lock,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { UiDensity, UserProfile, VaultScope } from "@/types/vault";

interface ProfileDropdownProps {
  profile: UserProfile;
  scope: VaultScope;
  density: UiDensity;
  onToggleDensity: (newDensity: UiDensity) => void;
  onOpenEditProfile: () => void;
  onNavigateToSettings: () => void;
  onOpenShortcuts?: () => void;
  onLockVault?: () => void;
}

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  slate: { bg: "bg-slate-800", text: "text-slate-200", border: "border-slate-700" },
  blue: { bg: "bg-blue-600", text: "text-white", border: "border-blue-500" },
  emerald: { bg: "bg-emerald-600", text: "text-white", border: "border-emerald-500" },
  violet: { bg: "bg-violet-600", text: "text-white", border: "border-violet-500" },
  amber: { bg: "bg-amber-600", text: "text-white", border: "border-amber-500" },
  rose: { bg: "bg-rose-600", text: "text-white", border: "border-rose-500" },
};

export function ProfileDropdown({
  profile,
  scope,
  density,
  onToggleDensity,
  onOpenEditProfile,
  onNavigateToSettings,
  onOpenShortcuts,
  onLockVault,
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initials = profile.name
    ? profile.name
        .trim()
        .split(/\s+/)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "SK";

  const colorConfig = COLOR_MAP[profile.avatarColor || "slate"] || COLOR_MAP.slate;

  // Click outside to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Escape key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Interactive Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 rounded-lg p-1 transition cursor-pointer select-none border ${
          isOpen
            ? "border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/20 bg-[var(--bg-card)]"
            : "border-transparent hover:border-[var(--border-subtle)] hover:bg-[var(--bg-app)]"
        }`}
        title="Account & Profile Settings"
        aria-expanded={isOpen}
      >
        <div
          className={`grid size-7 place-items-center rounded-md font-semibold text-[11px] border shadow-2xs ${colorConfig.bg} ${colorConfig.text} ${colorConfig.border} shrink-0`}
        >
          {initials}
        </div>
        <ChevronDown
          className={`size-3 text-[var(--text-muted)] transition-transform duration-150 ${
            isOpen ? "rotate-180 text-[var(--text-primary)]" : ""
          }`}
        />
      </button>

      {/* Floating Menu Card */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-68 origin-top-right rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 select-none">
          {/* Header Identity Section */}
          <div className="flex items-center gap-3 p-2 border-b border-[var(--border-subtle)] pb-3 mb-1">
            <div
              className={`grid size-9 place-items-center rounded-lg font-bold text-xs border shadow-xs shrink-0 ${colorConfig.bg} ${colorConfig.text} ${colorConfig.border}`}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-xs font-bold text-[var(--text-primary)]">
                  {profile.name || "Sahil Thakur"}
                </span>
              </div>
              <span className="block truncate text-[10px] text-[var(--text-muted)]">
                {profile.email || "sahilthakur3109@gmail.com"}
              </span>
              <div className="mt-1 flex items-center gap-1">
                <span className="inline-flex items-center gap-1 rounded bg-[var(--bg-app)] px-1.5 py-0.2 text-[9px] font-medium text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                  <Shield className="size-2 text-emerald-400" />
                  {scope === "personal" ? "Personal Vault" : "Organization"}
                </span>
              </div>
            </div>
          </div>

          {/* Action List */}
          <div className="space-y-0.5">
            {/* Edit Profile */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenEditProfile();
              }}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-app)] transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <User className="size-3.5 text-blue-500" />
                <span>Edit Profile</span>
              </div>
              <span className="text-[10px] text-[var(--text-muted)]">Details</span>
            </button>

            {/* Layout Density Switcher */}
            <div className="rounded-lg bg-[var(--bg-app)] p-2 my-1 border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-secondary)]">
                  <AlignJustify className="size-3 text-blue-500" />
                  Display Density
                </span>
                <span className="text-[10px] font-semibold text-[var(--text-primary)] capitalize">
                  {density}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => onToggleDensity("comfortable")}
                  className={`flex items-center justify-center gap-1 rounded py-1 text-[10px] font-medium transition cursor-pointer border ${
                    density === "comfortable"
                      ? "bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--accent-primary)]/40 shadow-2xs font-semibold"
                      : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {density === "comfortable" && <Check className="size-2.5 text-blue-500" />}
                  Comfortable
                </button>
                <button
                  type="button"
                  onClick={() => onToggleDensity("compact")}
                  className={`flex items-center justify-center gap-1 rounded py-1 text-[10px] font-medium transition cursor-pointer border ${
                    density === "compact"
                      ? "bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--accent-primary)]/40 shadow-2xs font-semibold"
                      : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {density === "compact" && <Check className="size-2.5 text-blue-500" />}
                  Compact
                </button>
              </div>
            </div>

            {/* Settings */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onNavigateToSettings();
              }}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-app)] transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Settings className="size-3.5 text-slate-400" />
                <span>Vault Preferences</span>
              </div>
              <span className="text-[10px] text-[var(--text-muted)]">Settings</span>
            </button>

            {/* Keyboard Shortcuts */}
            {onOpenShortcuts && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenShortcuts();
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-app)] transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Command className="size-3.5 text-slate-400" />
                  <span>Shortcuts Cheat Sheet</span>
                </div>
                <kbd className="rounded border border-[var(--border-subtle)] bg-[var(--bg-card)] px-1 text-[9px] font-mono text-[var(--text-muted)]">
                  ⌘/
                </kbd>
              </button>
            )}
          </div>

          {/* Footer: Lock Vault */}
          {onLockVault && (
            <div className="mt-1 pt-1 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onLockVault();
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Lock className="size-3.5 text-rose-500" />
                  <span>Lock Vault</span>
                </div>
                <kbd className="rounded border border-rose-500/30 bg-rose-500/10 px-1 text-[9px] font-mono text-rose-400">
                  ⌘L
                </kbd>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
